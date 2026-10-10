import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CommentService } from '../Services/commentService';
import { notificationCenter } from '../notificationEvents';
import { catchAsync } from '../utils/catchAsync';
import { status } from '../utils/status';

/**
 * Get all active comments for a specific post
 */
export const getComments = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const comments = await CommentService.getComments(postId);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    data: comments,
  });
});

/**
 * Add a new comment to a post
 */
export const createComment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const authorId = req.user!._id;

  const comment = await CommentService.addComment(postId, authorId, content);
  (req as any).createdId = comment._id;

  notificationCenter.broadcast({
    type: 'comment',
    title: 'New Discussion Comment',
    message: `${req.user?.name} commented: "${content.slice(0, 45)}..."`,
  });

  res.status(status.CREATED).json({
    success: true,
    statusCode: status.CREATED,
    message: 'Comment posted successfully',
    data: comment,
  });
});

/**
 * Update an existing comment (Owner or Admin)
 */
export const updateComment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const updated = await CommentService.updateComment(commentId, content);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: 'Comment updated successfully',
    data: updated,
  });
});

/**
 * Delete a comment (Owner or Admin)
 */
export const deleteComment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const result = await CommentService.deleteComment(commentId);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: 'Comment deleted successfully',
    data: result,
  });
});

/**
 * List all comments across the platform (Admin moderation)
 */
export const getAllCommentsAdmin = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const comments = await CommentService.getAllCommentsAdmin();

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    data: comments,
  });
});

// Backward compatibility controller object
export const CommentController = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getAllCommentsAdmin,
};

export default CommentController;
