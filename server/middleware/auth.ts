import { Request, Response, NextFunction } from 'express';
import { verifyToken, Payload } from '../utils/jwt';
import { findUserById, sanitizeUser } from '../schema/userschema';
import { IUserDoc } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: Omit<IUserDoc, 'passwordHash'>;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication token missing. Please sign in.',
        error: { code: 'UNAUTHORIZED', details: 'No Bearer token provided' },
      });
      return;
    }

    const decoded = verifyToken(token);
    const userId = decoded.id || (decoded as any).userId;
    const user = await findUserById(userId);

    if (!user) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'User associated with this token no longer exists.',
        error: { code: 'USER_NOT_FOUND' },
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Account has been suspended. Please contact an administrator.',
        error: { code: 'ACCOUNT_SUSPENDED' },
      });
      return;
    }

    req.user = sanitizeUser(user);
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Access token expired. Please refresh your session.',
        error: { code: 'TOKEN_EXPIRED' },
      });
      return;
    }

    res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid authorization token.',
      error: { code: 'INVALID_TOKEN', details: err.message },
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyToken(token);
      const userId = decoded.id || (decoded as any).userId;
      const user = await findUserById(userId);
      if (user && user.status !== 'suspended') {
        req.user = sanitizeUser(user);
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};
