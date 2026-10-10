import { PostModel, PostFindOptions } from '../schema/postschema';
import { dbStore } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class PostService {
  static async listPosts(options: PostFindOptions = {}) {
    return PostModel.findWithPagination(options);
  }

  static async getPost(identifier: string, includeDeleted = false, trackView = false) {
    let post = await PostModel.findBySlug(identifier, includeDeleted);
    if (!post) {
      post = await PostModel.findById(identifier, includeDeleted);
    }

    if (!post) {
      throw new AppError('Blog post not found or has been removed', 404, 'POST_NOT_FOUND');
    }

    if (trackView) {
      await PostModel.incrementViews(post._id);
      post.views += 1;
    }

    return PostModel.populateOne(post);
  }

  static async createPost(
    data: {
      title: string;
      content: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
      coverImage?: string;
      featured?: boolean;
    },
    authorId: string
  ) {
    const created = await PostModel.create({
      ...data,
      author: authorId,
    });

    return PostModel.populateOne(created);
  }

  static async updatePost(
    id: string,
    updates: {
      title?: string;
      content?: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
      coverImage?: string;
      featured?: boolean;
    }
  ) {
    const updated = await PostModel.findByIdAndUpdate(id, updates);
    if (!updated) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }
    return PostModel.populateOne(updated);
  }

  static async softDeletePost(id: string) {
    const deleted = await PostModel.softDelete(id);
    if (!deleted) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }
    return PostModel.populateOne(deleted);
  }

  static async restorePost(id: string) {
    const restored = await PostModel.restore(id);
    if (!restored) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }
    return PostModel.populateOne(restored);
  }

  static async hardDeletePost(id: string) {
    const success = await PostModel.hardDelete(id);
    if (!success) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }
    return { success: true, message: 'Post permanently deleted from database.' };
  }

  static async getMetaTaxonomy() {
    const categoriesSet = new Set<string>();
    const tagsSet = new Set<string>();

    dbStore.posts
      .filter(p => !p.isDeleted)
      .forEach(p => {
        if (p.category) categoriesSet.add(p.category);
        if (p.tags) p.tags.forEach(t => tagsSet.add(t));
      });

    return {
      categories: ['All', ...Array.from(categoriesSet)],
      tags: Array.from(tagsSet),
    };
  }

  static async getTaxonomy() {
    return PostService.getMetaTaxonomy();
  }
}
