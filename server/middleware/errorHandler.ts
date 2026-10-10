import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'An unexpected internal error occurred';
  const code = err.code || 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    console.error(`[API Error ${statusCode}]`, err);
  } else {
    console.warn(`[API Notice ${statusCode}] ${message} (${code})`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: {
      code,
      details: err.details || null,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
