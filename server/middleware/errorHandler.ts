import { Request, Response, NextFunction } from 'express';

export interface IAppError extends Error {
  statusCode: number;
  code: string;
  details?: any;
}

export interface AppErrorConstructor {
  new (message: string, statusCode?: number, code?: string, details?: any): IAppError;
  (message: string, statusCode?: number, code?: string, details?: any): IAppError;
}

export function createAppError(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any): IAppError {
  const err = new Error(message) as IAppError;
  err.name = 'AppError';
  err.statusCode = statusCode;
  err.code = code;
  err.details = details;
  return err;
}

export const AppError: AppErrorConstructor = function (
  this: any,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: any
): IAppError {
  return createAppError(message, statusCode, code, details);
} as unknown as AppErrorConstructor;

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
