import mongoose from "mongoose";
import { ICommentProps } from "../utils/types";
import { sanitizeUser } from "./userschema";

const commentSchema = new mongoose.Schema<ICommentProps>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post ID is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ isDeleted: 1 });

export const Comment =
  mongoose.models.Comment ||
  mongoose.model<ICommentProps>("Comment", commentSchema);
export default Comment;

// Standalone functions replacing CommentModel class
export async function findCommentById(id: string): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  return Comment.findOne({ _id: id, isDeleted: false })
    .populate("author", "name email avatar userRole role")
    .lean();
}

export async function findCommentsForPost(postId: string) {
  if (!postId || !mongoose.isValidObjectId(postId)) {
    return [];
  }
  const comments = await Comment.find({ postId, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate("author", "name email avatar userRole role")
    .lean();

  return comments.map((c) => ({
    ...c,
    author: c.author
      ? sanitizeUser(c.author)
      : { _id: c.author, name: "Anonymous", email: "" },
  }));
}

export async function createCommentDoc(data: {
  postId: string;
  author: string;
  content: string;
  _id?: any;
}): Promise<any> {
  const commentPayload: Record<string, any> = {
    postId: data.postId,
    author: data.author,
    content: data.content,
    isDeleted: false,
  };

  if (data._id) {
    commentPayload._id = data._id;
  }

  const created = await Comment.create(commentPayload);

  const populated = await Comment.findById(created._id)
    .populate("author", "name email avatar userRole role")
    .lean();

  return {
    ...populated,
    author: populated?.author
      ? sanitizeUser(populated.author)
      : { _id: data.author, name: "Anonymous", email: "" },
  };
}

export async function updateCommentById(
  id: string,
  updates: Partial<ICommentProps>,
): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  const updated = await Comment.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
  })
    .populate("author", "name email avatar userRole role")
    .lean();

  if (!updated) return null;

  return {
    ...updated,
    author: updated.author
      ? sanitizeUser(updated.author)
      : { _id: updated.author, name: "Anonymous", email: "" },
  };
}

export async function deleteCommentById(id: string): Promise<boolean> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return false;
  }
  const result = await Comment.findByIdAndDelete(id);
  return !!result;
}

export async function findAllCommentsPopulated(limit = 50) {
  const comments = await Comment.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", "name email avatar userRole role")
    .populate("postId", "title slug")
    .lean();

  return comments.map((c: any) => ({
    ...c,
    author: c.author
      ? sanitizeUser(c.author)
      : { _id: c.author, name: "Anonymous", email: "" },
    postTitle: c.postId?.title || "Unknown Post",
    postSlug: c.postId?.slug || "",
  }));
}

export async function countComments(
  filter: Record<string, any> = {},
): Promise<number> {
  return Comment.countDocuments(filter);
}

// Plain function dictionary for backward compatibility (no class)
export const CommentModel = {
  findById: findCommentById,
  findForPost: findCommentsForPost,
  create: createCommentDoc,
  findByIdAndUpdate: updateCommentById,
  findByIdAndDelete: deleteCommentById,
  findAllPopulated: findAllCommentsPopulated,
  countDocuments: countComments,
};
