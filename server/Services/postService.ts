import {
  findPostsWithPagination,
  findPostBySlug,
  findPostById,
  incrementPostViews,
  populateOnePost,
  createPostDoc,
  updatePostById,
  softDeletePostDoc,
  restorePostDoc,
  hardDeletePostDoc,
  PostFindOptions,
} from '../schema/postschema';
import { AppError } from '../middleware/errorHandler';

export async function listPostsService(options: PostFindOptions = {}) {
  return findPostsWithPagination(options);
}

export async function getPostService(identifier: string, includeDeleted = false, trackView = false) {
  let post = await findPostBySlug(identifier, includeDeleted);
  if (!post) {
    post = await findPostById(identifier, includeDeleted);
  }

  if (!post) {
    throw new AppError('Blog post not found or has been removed', 404, 'POST_NOT_FOUND');
  }

  if (trackView) {
    await incrementPostViews(post._id);
    post.views = (post.views || 0) + 1;
  }

  return populateOnePost(post);
}

export async function createPostService(
  data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
  },
  authorId: string
) {
  const created = await createPostDoc({
    ...data,
    author: authorId,
  });

  return populateOnePost(created);
}

export async function updatePostService(
  id: string,
  updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
  }
) {
  const updated = await updatePostById(id, updates);
  if (!updated) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  return populateOnePost(updated);
}

export async function softDeletePostService(id: string) {
  const deleted = await softDeletePostDoc(id);
  if (!deleted) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  return populateOnePost(deleted);
}

export async function restorePostService(id: string) {
  const restored = await restorePostDoc(id);
  if (!restored) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  return populateOnePost(restored);
}

export async function hardDeletePostService(id: string) {
  const success = await hardDeletePostDoc(id);
  if (!success) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  return { success: true, message: 'Post permanently deleted from database.' };
}

export async function getTaxonomyService() {
  return {};
}

// Function object namespace for backwards compatibility (no class)
export const PostService = {
  listPosts: listPostsService,
  getPost: getPostService,
  createPost: createPostService,
  updatePost: updatePostService,
  softDeletePost: softDeletePostService,
  restorePost: restorePostService,
  hardDeletePost: hardDeletePostService,
  getTaxonomy: getTaxonomyService,
};
