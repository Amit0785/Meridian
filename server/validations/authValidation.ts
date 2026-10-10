import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
  role: z.enum(['admin', 'user']).optional().default('user'),
  userRole: z.enum(['admin', 'user']).optional(),
  bio: z.string().max(300).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'facebook']).default('google'),
  token: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email('Valid email is required').optional(),
  avatar: z.string().optional(),
});
