import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getAllCommentsAdmin,
} from '../Controller/commentController';
import { authenticateJWT, optionalAuth } from '../middleware/auth';
import { checkCommentOwnershipOrAdmin, requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { logActivity } from '../middleware/activityLogger';
import { createCommentSchema, updateCommentSchema } from '../validations/commentValidation';

const router = Router();

router.get('/post/:postId', optionalAuth, getComments);

router.post(
  '/post/:postId',
  authenticateJWT,
  validateRequest(createCommentSchema),
  logActivity('COMMENT_CREATED', 'comment', req => `Commented on post ${req.params.postId}`),
  createComment
);

router.put(
  '/:commentId',
  authenticateJWT,
  checkCommentOwnershipOrAdmin,
  validateRequest(updateCommentSchema),
  logActivity('COMMENT_UPDATED', 'comment', req => `Updated comment ${req.params.commentId}`),
  updateComment
);

router.delete(
  '/:commentId',
  authenticateJWT,
  checkCommentOwnershipOrAdmin,
  logActivity('COMMENT_DELETED', 'comment', req => `Deleted comment ${req.params.commentId}`),
  deleteComment
);

router.get(
  '/all',
  authenticateJWT,
  requireRole('admin'),
  getAllCommentsAdmin
);

export default router;
