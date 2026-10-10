import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err?.issues) {
        const issues = (err as ZodError).issues || (err as any).errors || [];
        const formattedErrors = issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Payload validation failed',
          error: {
            code: 'VALIDATION_ERROR',
            details: formattedErrors,
          },
        });
        return;
      }

      res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Malformed request data',
        error: { code: 'BAD_REQUEST' },
      });
    }
  };
};
