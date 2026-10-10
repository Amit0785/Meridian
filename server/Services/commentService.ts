import { CommentModel } from '../schema/commentschema';
import { PostModel } from '../schema/postschema';
import { AppError } from '../middleware/errorHandler';

export class CommentService {
  static async getComments(postId: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new AppError('Associated post not found', 404, 'POST_NOT_FOUND');
    }
    return CommentModel.findForPost(postId);
  }

  static async addComment(postId: string, authorId: string, content: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new AppError('Cannot comment on non-existent post', 404, 'POST_NOT_FOUND');
    }

    return CommentModel.create({
      postId,
      author: authorId,
      content,
    });
  }

  static async updateComment(commentId: string, content: string) {
    const updated = await CommentModel.findByIdAndUpdate(commentId, { content });
    if (!updated) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }
    return updated;
  }

  static async deleteComment(commentId: string) {
    const deleted = await CommentModel.findByIdAndDelete(commentId);
    if (!deleted) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }
    return { success: true, message: 'Comment deleted successfully' };
  }

  static async getAllCommentsAdmin(limit = 50) {
    return CommentModel.findAllPopulated(limit);
  }
}
