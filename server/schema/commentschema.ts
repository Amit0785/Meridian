import { dbStore, ICommentDoc } from '../config/database';
import { UserModel } from './userschema';

export class CommentModel {
  static async findById(id: string): Promise<ICommentDoc | null> {
    const comment = dbStore.comments.find(c => c._id === id && !c.isDeleted);
    return comment ? { ...comment } : null;
  }

  static async findForPost(postId: string) {
    const comments = dbStore.comments.filter(c => c.postId === postId && !c.isDeleted);
    
    // Sort chronological: oldest to newest
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Populate Author references
    const populated = await Promise.all(
      comments.map(async comment => {
        const author = await UserModel.findById(comment.author);
        return {
          ...comment,
          author: author ? UserModel.sanitize(author) : { _id: comment.author, name: 'Anonymous', email: '' },
        };
      })
    );

    return populated;
  }

  static async create(data: {
    postId: string;
    author: string;
    content: string;
  }): Promise<any> {
    const newComment: ICommentDoc = {
      _id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: data.postId,
      author: data.author,
      content: data.content,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.comments.push(newComment);
    const author = await UserModel.findById(data.author);
    return {
      ...newComment,
      author: author ? UserModel.sanitize(author) : { _id: data.author, name: 'Anonymous', email: '' },
    };
  }

  static async findByIdAndUpdate(id: string, updates: Partial<ICommentDoc>): Promise<any | null> {
    const index = dbStore.comments.findIndex(c => c._id === id);
    if (index === -1) return null;

    dbStore.comments[index] = {
      ...dbStore.comments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const author = await UserModel.findById(dbStore.comments[index].author);
    return {
      ...dbStore.comments[index],
      author: author ? UserModel.sanitize(author) : { _id: dbStore.comments[index].author, name: 'Anonymous', email: '' },
    };
  }

  static async findByIdAndDelete(id: string): Promise<boolean> {
    const index = dbStore.comments.findIndex(c => c._id === id);
    if (index === -1) return false;

    dbStore.comments.splice(index, 1);
    return true;
  }

  static async findAllPopulated(limit = 50) {
    const list = [...dbStore.comments].slice(-limit).reverse();
    return Promise.all(
      list.map(async c => {
        const author = await UserModel.findById(c.author);
        const post = dbStore.posts.find(p => p._id === c.postId);
        return {
          ...c,
          author: author ? UserModel.sanitize(author) : { _id: c.author, name: 'Anonymous', email: '' },
          postTitle: post?.title || 'Unknown Post',
          postSlug: post?.slug || '',
        };
      })
    );
  }

  static async countDocuments(filter: { isDeleted?: boolean } = {}): Promise<number> {
    return dbStore.comments.filter(c => {
      if (filter.isDeleted !== undefined && c.isDeleted !== filter.isDeleted) return false;
      return true;
    }).length;
  }
}

export const CommentSchema = CommentModel;

/**
 * Mongoose Schema Indexes definition for query optimization:
 * - postId & createdAt: compound index for rapid retrieval of post discussion threads
 * - author: index for user activity moderation
 * - isDeleted: index for soft-delete filtering
 */
export const CommentMongooseIndexes = [
  { fields: { postId: 1, createdAt: -1 } },
  { fields: { author: 1 } },
  { fields: { isDeleted: 1 } },
];
