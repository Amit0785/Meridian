import { Request, Response, NextFunction } from 'express';

export type AsyncRequestHandler = (
  req: any,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Higher-order function wrapping async route handlers
 * to automatically forward unhandled promise rejections to Express next(err)
 */
export const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
