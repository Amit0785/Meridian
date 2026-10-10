import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { ActivityLogModel } from '../schema/activitylogschema';

export const logActivity = (action: string, targetType: 'post' | 'comment' | 'user' | 'auth' | 'system', getDetails?: (req: AuthenticatedRequest) => string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // Intercept finish to only log successful operations (2xx or 3xx)
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const user = req.user;
          const details = getDetails ? getDetails(req) : `${action} executed successfully`;
          const targetId = req.params.id || req.params.postId || req.params.commentId || (req as any).createdId;

          await ActivityLogModel.log({
            action,
            userId: user?._id,
            userEmail: user?.email,
            targetType,
            targetId,
            details,
            ipAddress: req.ip || req.socket.remoteAddress,
          });
        } catch (err) {
          console.error('Failed to write activity log:', err);
        }
      }
    });

    next();
  };
};
