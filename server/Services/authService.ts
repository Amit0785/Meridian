import {
  UserModel,
  findUserByEmail,
  findUserById,
  createUserDoc,
  compareUserPassword,
  sanitizeUser,
} from "../schema/userschema";
import { AppError } from "../middleware/errorHandler";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken,
} from "../utils/jwt";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export const generateUserTokens = (user: {
  _id: string;
  email: string;
  userRole?: string;
  name?: string;
}): TokenPair => {
  const accessToken = generateToken({
    _id: user._id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    _id: user._id,
    email: user.email,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: "15m",
  };
};

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  userRole?: "admin" | "user";
}) {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new AppError(
      "An account with this email already exists",
      409,
      "EMAIL_EXISTS",
    );
  }

  const user = await createUserDoc({
    name: data.name,
    email: data.email,
    password: data.password,
    userRole: data.userRole || "user",

    provider: "local",
  });

  const tokens = generateUserTokens(user);

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

export async function loginUser(email: string, plainPassword: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(
      "Invalid email or password credentials",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  if (user.status === "suspended") {
    throw new AppError(
      "Your account has been suspended by an administrator",
      403,
      "ACCOUNT_SUSPENDED",
    );
  }

  const isMatch = await compareUserPassword(
    plainPassword,
    user.password || user.passwordHash,
  );
  if (!isMatch) {
    throw new AppError(
      "Invalid email or password credentials",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const tokens = generateUserTokens(user);

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

export async function refreshUserTokens(refreshToken: string) {
  let decoded: { id: string; email: string };
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    try {
      decoded = verifyToken(refreshToken);
    } catch {
      throw new AppError(
        "Invalid or expired refresh token. Please sign in again.",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }
  }

  const userId = decoded.id;
  let user = userId ? await findUserById(userId) : null;

  if (!user && decoded.email) {
    user = await findUserByEmail(decoded.email);
  }

  if (!user) {
    throw new AppError(
      "User session invalid or user not found.",
      401,
      "USER_NOT_FOUND",
    );
  }

  if (user.status === "suspended") {
    throw new AppError("Account is suspended", 403, "ACCOUNT_SUSPENDED");
  }

  const tokens = generateUserTokens(user);

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

export async function socialLoginUser(data: {
  provider: "google" | "facebook";
  token?: string;
  name?: string;
  email?: string;
  avatar?: string;
}) {
  let email = data.email?.toLowerCase();
  let name = data.name;
  let avatar = data.avatar;

  if (data.token) {
    try {
      const parts = data.token.split(".");
      if (parts.length >= 2) {
        let payloadJson = "";
        try {
          payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
        } catch {
          payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
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
      console.warn("Failed to parse token payload in socialLogin:", err);
    }
  }

  if (!email) {
    email =
      data.email?.toLowerCase() || `${data.provider}.${Date.now()}@meridian.io`;
  }

  if (!name) {
    name = email.split("@")[0];
  }

  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUserDoc({
      name,
      email,
      avatar:
        avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      userRole: "user",
      provider: data.provider,
    });
  }

  if (user.status === "suspended") {
    throw new AppError("Account is suspended", 403, "ACCOUNT_SUSPENDED");
  }

  const tokens = generateUserTokens(user);

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

// Function object namespace for backwards compatibility (no class)
export const AuthService = {
  generateTokens: generateUserTokens,
  register: registerUser,
  login: loginUser,
  refresh: refreshUserTokens,
  socialLogin: socialLoginUser,
};
