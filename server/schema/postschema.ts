import mongoose from "mongoose";
import { IPostProps } from "../utils/types";

export interface PostFindOptions {
  includeDeleted?: boolean;
  search?: string;
  authorId?: string;
  sortBy?: "createdAt" | "views" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

const postSchema = new mongoose.Schema<IPostProps>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, createdAt: -1 });

export const Post =
  mongoose.models.Post || mongoose.model<IPostProps>("Post", postSchema);
export default Post;

// Standalone functions replacing PostModel class
export async function generateSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug || `post-${Date.now()}`;
  let counter = 1;
  while (await Post.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export function generateSlugSync(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return baseSlug || `post-${Date.now()}`;
}

export async function findPostById(
  id: string,
  includeDeleted = false,
): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  const filter: Record<string, any> = { _id: id };
  if (!includeDeleted) {
    filter.isDeleted = false;
  }
  return Post.findOne(filter)
    .populate("author", "name email avatar userRole")
    .lean();
}

export async function findPostBySlug(
  slug: string,
  includeDeleted = false,
): Promise<any | null> {
  const filter: Record<string, any> = { slug };
  if (!includeDeleted) {
    filter.isDeleted = false;
  }
  return Post.findOne(filter)
    .populate("author", "name email avatar userRole")
    .lean();
}

export async function findPostsWithPagination(options: PostFindOptions = {}) {
  const {
    includeDeleted = false,
    search,
    authorId,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 9,
  } = options;

  const filter: Record<string, any> = {};

  if (!includeDeleted) {
    filter.isDeleted = false;
  }

  if (authorId) {
    if (mongoose.isValidObjectId(authorId)) {
      filter.author = authorId;
    } else {
      return {
        posts: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { excerpt: searchRegex },
    ];
  }

  const sortObj: Record<string, any> = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

  const totalCount = await Post.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const skip = (page - 1) * limit;

  const posts = await Post.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .populate("author", "name email avatar userRole")
    .lean();

  const formattedPosts = posts.map((p) => ({
    ...p,
    author: p.author || {
      _id: "unknown",
      name: "Anonymous",
      email: "",
      userRole: "user",
    },
  }));

  return {
    posts: formattedPosts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function createPostDoc(data: {
  title: string;
  content: string;
  author: string;
  excerpt?: string;
  coverImage?: string;
  _id?: any;
}): Promise<any> {
  const slug = await generateSlug(data.title);
  const excerpt =
    data.excerpt ||
    data.content
      .slice(0, 160)
      .replace(/[#*`\n]/g, "")
      .trim() + "...";

  const postDoc: Record<string, any> = {
    title: data.title,
    slug,
    content: data.content,
    excerpt,
    coverImage:
      data.coverImage ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    author: data.author,
    isDeleted: false,
    deletedAt: null,
    views: 0,
  };

  if (data._id) {
    postDoc._id = data._id;
  }

  const created = await Post.create(postDoc);
  return Post.findById(created._id)
    .populate("author", "name email avatar userRole")
    .lean();
}

export async function updatePostById(
  id: string,
  updates: Partial<IPostProps>,
): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }

  if (updates.title && !updates.slug) {
    const existing = await Post.findById(id);
    if (existing && existing.title !== updates.title) {
      updates.slug = await generateSlug(updates.title);
    }
  }

  const updated = await Post.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
  })
    .populate("author", "name email avatar userRole")
    .lean();

  return updated;
}

export async function softDeletePostDoc(id: string): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }

  const updated = await Post.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { returnDocument: "after" },
  )
    .populate("author", "name email avatar userRole")
    .lean();

  return updated;
}

export async function restorePostDoc(id: string): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }

  const updated = await Post.findByIdAndUpdate(
    id,
    { isDeleted: false, deletedAt: null },
    { returnDocument: "after" },
  )
    .populate("author", "name email avatar userRole")
    .lean();

  return updated;
}

export async function hardDeletePostDoc(id: string): Promise<boolean> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return false;
  }

  const { Comment } = await import("./commentschema");
  const result = await Post.findByIdAndDelete(id);
  await Comment.deleteMany({ postId: id });
  return !!result;
}

export async function incrementPostViews(id: string): Promise<void> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return;
  }
  await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
}

export async function countPosts(
  filter: Record<string, any> = {},
): Promise<number> {
  return Post.countDocuments(filter);
}

export async function populateOnePost(post: any) {
  if (!post) return null;
  if (post.author && typeof post.author === "object") {
    return post;
  }
  const populated = await Post.findById(post._id || post)
    .populate("author", "name email avatar userRole")
    .lean();
  return populated || post;
}

// Plain function dictionary for backward compatibility (no class)
export const PostModel = {
  generateSlug,
  generateSlugSync,
  findById: findPostById,
  findBySlug: findPostBySlug,
  findWithPagination: findPostsWithPagination,
  create: createPostDoc,
  findByIdAndUpdate: updatePostById,
  softDelete: softDeletePostDoc,
  restore: restorePostDoc,
  hardDelete: hardDeletePostDoc,
  incrementViews: incrementPostViews,
  countDocuments: countPosts,
  populateOne: populateOnePost,
};
