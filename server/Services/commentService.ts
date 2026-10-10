import {
  findCommentsForPost,
  createCommentDoc,
  updateCommentById,
  deleteCommentById,
  findAllCommentsPopulated,
} from "../schema/commentschema";
import { findPostById } from "../schema/postschema";
import { AppError } from "../middleware/errorHandler";

export async function getCommentsService(
  postId: string,
  includeDeleted = false,
) {
  const post = await findPostById(postId, includeDeleted);

  if (!post) {
    throw new AppError("Associated post not found", 404, "POST_NOT_FOUND");
  }

  return findCommentsForPost(postId);
}

export async function addCommentService(
  postId: string,
  authorId: string,
  content: string,
) {
  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(
      "Cannot comment on non-existent post",
      404,
      "POST_NOT_FOUND",
    );
  }

  return createCommentDoc({
    postId,
    author: authorId,
    content,
  });
}

export async function updateCommentService(commentId: string, content: string) {
  const updated = await updateCommentById(commentId, { content });
  if (!updated) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }
  return updated;
}

export async function deleteCommentService(commentId: string) {
  const deleted = await deleteCommentById(commentId);
  if (!deleted) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }
  return { success: true, message: "Comment deleted successfully" };
}

export async function getAllCommentsAdminService(limit = 50) {
  return findAllCommentsPopulated(limit);
}

// Function object namespace for backwards compatibility (no class)
export const CommentService = {
  getComments: getCommentsService,
  addComment: addCommentService,
  updateComment: updateCommentService,
  deleteComment: deleteCommentService,
  getAllCommentsAdmin: getAllCommentsAdminService,
};
