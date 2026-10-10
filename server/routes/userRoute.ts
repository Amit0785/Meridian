import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  socialLogin,
  getMe,
} from '../Controller/userController';
import { authenticateJWT } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { logActivity } from '../middleware/activityLogger';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  socialLoginSchema,
} from '../validations/authValidation';

const router = Router();

// Rate limiter for authentication attempts
const authLimiter = authRateLimiter({ windowMs: 15 * 60 * 1000, max: 25 });

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  logActivity('USER_REGISTERED', 'auth', req => `New account registered for ${req.body.email}`),
  registerUser
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  logActivity('USER_LOGIN', 'auth', req => `User signed in with ${req.body.email}`),
  loginUser
);

router.post('/logout', logoutUser);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  refreshToken
);

router.post(
  '/social-login',
  validateRequest(socialLoginSchema),
  logActivity('SOCIAL_LOGIN', 'auth', req => `Social sign-in via ${req.body.provider} for ${req.body.email}`),
  socialLogin
);

router.get('/me', authenticateJWT, getMe);

export default router;
