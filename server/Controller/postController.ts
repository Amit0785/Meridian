import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PostService } from '../Services/postService';
import { notificationCenter } from '../notificationEvents';
import { catchAsync } from '../utils/catchAsync';
import { status } from '../utils/status';

/**
 * List posts with pagination, category, tag, search, and soft-delete filters
 */
export const listPosts = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '9', 10);
  const search = req.query.search as string;
  const category = req.query.category as string;
  const tag = req.query.tag as string;
  const authorId = req.query.authorId as string;
  const sortBy = ((req.query.sortBy as 'createdAt' | 'views' | 'title') || 'createdAt');
  const sortOrder = ((req.query.sortOrder as 'asc' | 'desc') || 'desc');

  let includeDeleted = false;
  if (req.query.includeDeleted === 'true') {
    if (req.user?.role === 'admin' || (req.user && authorId === req.user._id)) {
      includeDeleted = true;
    }
  }

  const result = await PostService.listPosts({
    page,
    limit,
    search,
    category,
    tag,
    authorId,
    sortBy,
    sortOrder,
    includeDeleted,
  });

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    data: result.posts,
    pagination: result.pagination,
  });
});

/**
 * Get single post by slug or ID with view counter increment
 */
export const getPost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { identifier } = req.params;
  const isAdmin = req.user?.role === 'admin';
  const post = await PostService.getPost(identifier, isAdmin, true);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    data: post,
  });
});

/**
 * Create a new blog post
 */
export const createPost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const authorId = req.user!._id;
  const post = await PostService.createPost(req.body, authorId);
  (req as any).createdId = post._id;

  notificationCenter.broadcast({
    type: 'post',
    title: 'New Article Published',
    message: `"${post.title}" by ${req.user?.name}`,
  });

  res.status(status.CREATED).json({
    success: true,
    statusCode: status.CREATED,
    message: 'Post created successfully',
    data: post,
  });
});

/**
 * Update existing blog post (Owner or Admin)
 */
export const updatePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = await PostService.updatePost(id, req.body);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: 'Post updated successfully',
    data: updated,
  });
});

/**
 * Soft delete post (Move to trash)
 */
export const softDeletePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await PostService.softDeletePost(id);

  notificationCenter.broadcast({
    type: 'system',
    title: 'Post Moved to Trash',
    message: `Article was archived and soft-deleted.`,
  });

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: 'Post moved to trash (soft-deleted)',
    data: deleted,
  });
});

/**
 * Restore a soft-deleted post from trash (Owner or Admin)
 */
export const restorePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const restored = await PostService.restorePost(id);

  notificationCenter.broadcast({
    type: 'system',
    title: 'Post Restored',
    message: `"${restored.title}" has been restored to publication.`,
  });

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: 'Post restored successfully',
    data: restored,
  });
});

/**
 * Permanently purge post and its comments (Admin only)
 */
export const hardDeletePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await PostService.hardDeletePost(id);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: 'Post permanently purged from database',
    data: null,
  });
});

/**
 * Get post categories and tags taxonomy
 */
export const getTaxonomy = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const taxonomy = await PostService.getTaxonomy();

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    data: taxonomy,
  });
});

// Backward compatibility controller object
export const PostController = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  softDeletePost,
  restorePost,
  hardDeletePost,
  getTaxonomy,
};

export default PostController;
