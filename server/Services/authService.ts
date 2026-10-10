import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserModel } from '../schema/userschema';
import { IUserDoc } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export const generateToken = (payload: { _id?: string; userId?: string; email: string; role?: string; name?: string }): string => {
  return jwt.sign(
    {
      userId: payload._id || payload.userId,
      email: payload.email,
      role: payload.role || 'user',
      name: payload.name || '',
    },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (payload: { _id?: string; userId?: string; email?: string }): string => {
  return jwt.sign(
    {
      userId: payload._id || payload.userId,
      email: payload.email,
      tokenVersion: 1,
    },
    ENV.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export class AuthService {
  static generateTokens(user: IUserDoc): TokenPair {
    const accessToken = generateToken({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: '15m',
    };
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
    bio?: string;
  }) {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
      bio: data.bio || '',
      provider: 'local',
    });

    const tokens = this.generateTokens(user);

    return {
      user: UserModel.sanitize(user),
      tokens,
    };
  }

  static async login(email: string, plainPassword: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended by an administrator', 403, 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await UserModel.comparePassword(plainPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user);

    return {
      user: UserModel.sanitize(user),
      tokens,
    };
  }

  static async refresh(refreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET);
    } catch {
      try {
        decoded = jwt.verify(refreshToken, ENV.JWT_ACCESS_SECRET);
      } catch {
        throw new AppError('Invalid or expired refresh token. Please sign in again.', 401, 'INVALID_REFRESH_TOKEN');
      }
    }

    const userId = decoded?.userId || decoded?._id || decoded?.id;
    let user = userId ? await UserModel.findById(userId) : null;

    if (!user && decoded?.email) {
      user = await UserModel.findOne({ email: decoded.email.toLowerCase() });
    }

    if (!user) {
      throw new AppError('User session invalid or user not found.', 401, 'USER_NOT_FOUND');
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    const tokens = this.generateTokens(user);

    return {
      user: UserModel.sanitize(user),
      tokens,
    };
  }

  static async socialLogin(data: {
    provider: 'google' | 'facebook';
    token?: string;
    name?: string;
    email?: string;
    avatar?: string;
  }) {
    let email = data.email?.toLowerCase();
    let name = data.name;
    let avatar = data.avatar;

    // If an auth token (e.g. Firebase ID token or Google credential token) is sent
    if (data.token) {
      try {
        // Decode JWT payload without external library dependencies if unverified or base64
        const parts = data.token.split('.');
        if (parts.length >= 2) {
          let payloadJson = '';
          try {
            payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
          } catch {
            payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          }
          const payload = JSON.parse(payloadJson);
          
          if (payload.email) {
            email = payload.email.toLowerCase();
          }
          if (payload.name && !name) {
            name = payload.name;
          }
          if (payload.picture && !avatar) {
            avatar = payload.picture;
          }
        }
      } catch (err) {
        console.warn('Failed to parse token payload in socialLogin:', err);
      }
    }

    if (!email) {
      email = data.email?.toLowerCase() || `${data.provider}.${Date.now()}@meridian.io`;
    }

    if (!name) {
      name = email.split('@')[0];
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name,
        email,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        role: 'user',
        provider: data.provider,
        bio: `Member via ${data.provider.toUpperCase()} single sign-on`,
      });
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    const tokens = this.generateTokens(user);

    return {
      user: UserModel.sanitize(user),
      tokens,
    };
  }
}
