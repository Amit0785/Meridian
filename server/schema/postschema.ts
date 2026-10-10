import { dbStore, IPostDoc } from '../config/database';
import { UserModel } from './userschema';

export interface PostFindOptions {
  includeDeleted?: boolean;
  search?: string;
  category?: string;
  tag?: string;
  authorId?: string;
  sortBy?: 'createdAt' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class PostModel {
  static generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug || `post-${Date.now()}`;
    let counter = 1;
    while (dbStore.posts.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  static async findById(id: string, includeDeleted = false): Promise<IPostDoc | null> {
    const post = dbStore.posts.find(p => p._id === id && (includeDeleted || !p.isDeleted));
    return post ? { ...post } : null;
  }

  static async findBySlug(slug: string, includeDeleted = false): Promise<IPostDoc | null> {
    const post = dbStore.posts.find(p => p.slug === slug && (includeDeleted || !p.isDeleted));
    return post ? { ...post } : null;
  }

  static async findWithPagination(options: PostFindOptions = {}) {
    const {
      includeDeleted = false,
      search,
      category,
      tag,
      authorId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = options;

    let filtered = dbStore.posts.filter(p => {
      if (!includeDeleted && p.isDeleted) return false;
      if (authorId && p.author !== authorId) return false;
      if (category && category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (tag && !p.tags.some(t => t.toLowerCase() === tag.toLowerCase())) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesContent = p.content.toLowerCase().includes(query);
        const matchesExcerpt = p.excerpt.toLowerCase().includes(query);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesContent && !matchesExcerpt && !matchesTags) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'title') {
        const comp = String(valA).localeCompare(String(valB));
        return sortOrder === 'asc' ? comp : -comp;
      }

      if (sortBy === 'views') {
        const comp = (valA as number) - (valB as number);
        return sortOrder === 'asc' ? comp : -comp;
      }

      // Default createdAt timestamp sort
      const timeA = new Date(valA as string).getTime();
      const timeB = new Date(valB as string).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Populate Author Reference
    const populated = await Promise.all(
      paginated.map(async post => {
        const authorUser = await UserModel.findById(post.author);
        return {
          ...post,
          author: authorUser
            ? {
                _id: authorUser._id,
                name: authorUser.name,
                email: authorUser.email,
                avatar: authorUser.avatar,
                role: authorUser.role,
              }
            : {
                _id: post.author,
                name: 'Anonymous',
                email: 'anonymous@meridian.dev',
                role: 'user',
              },
        };
      })
    );

    return {
      posts: populated,
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

  static async create(data: {
    title: string;
    content: string;
    author: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    coverImage?: string;
    featured?: boolean;
  }): Promise<IPostDoc> {
    const slug = this.generateSlug(data.title);
    const newPost: IPostDoc = {
      _id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || data.content.slice(0, 160).replace(/[#*`\n]/g, '').trim() + '...',
      category: data.category || 'General',
      tags: data.tags || [],
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      author: data.author,
      isDeleted: false,
      deletedAt: null,
      views: 0,
      featured: data.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.posts.unshift(newPost);
    return { ...newPost };
  }

  static async findByIdAndUpdate(id: string, updates: Partial<IPostDoc>): Promise<IPostDoc | null> {
    const index = dbStore.posts.findIndex(p => p._id === id);
    if (index === -1) return null;

    if (updates.title && updates.title !== dbStore.posts[index].title && !updates.slug) {
      updates.slug = this.generateSlug(updates.title);
    }

    dbStore.posts[index] = {
      ...dbStore.posts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return { ...dbStore.posts[index] };
  }

  static async softDelete(id: string): Promise<IPostDoc | null> {
    const index = dbStore.posts.findIndex(p => p._id === id);
    if (index === -1) return null;

    dbStore.posts[index].isDeleted = true;
    dbStore.posts[index].deletedAt = new Date().toISOString();
    dbStore.posts[index].updatedAt = new Date().toISOString();

    return { ...dbStore.posts[index] };
  }

  static async restore(id: string): Promise<IPostDoc | null> {
    const index = dbStore.posts.findIndex(p => p._id === id);
    if (index === -1) return null;

    dbStore.posts[index].isDeleted = false;
    dbStore.posts[index].deletedAt = null;
    dbStore.posts[index].updatedAt = new Date().toISOString();

    return { ...dbStore.posts[index] };
  }

  static async hardDelete(id: string): Promise<boolean> {
    const index = dbStore.posts.findIndex(p => p._id === id);
    if (index === -1) return false;

    dbStore.posts.splice(index, 1);
    dbStore.comments = dbStore.comments.filter(c => c.postId !== id);
    return true;
  }

  static async incrementViews(id: string): Promise<void> {
    const post = dbStore.posts.find(p => p._id === id);
    if (post) {
      post.views = (post.views || 0) + 1;
    }
  }

  static async countDocuments(filter: { isDeleted?: boolean } = {}): Promise<number> {
    return dbStore.posts.filter(p => {
      if (filter.isDeleted !== undefined && p.isDeleted !== filter.isDeleted) return false;
      return true;
    }).length;
  }

  static async populateOne(post: IPostDoc) {
    const authorUser = await UserModel.findById(post.author);
    return {
      ...post,
      author: authorUser
        ? {
            _id: authorUser._id,
            name: authorUser.name,
            email: authorUser.email,
            avatar: authorUser.avatar,
            role: authorUser.role,
          }
        : {
            _id: post.author,
            name: 'Anonymous',
            email: 'anonymous@meridian.dev',
            role: 'user',
          },
    };
  }
}

export const PostSchema = PostModel;

/**
 * Mongoose Schema Indexes definition for query optimization:
 * - slug: unique index for O(1) post retrieval
 * - author & createdAt: compound index for author feed lookups
 * - isDeleted & createdAt: compound index for filtered public timeline queries
 * - category: index for category taxonomy filter
 */
export const PostMongooseIndexes = [
  { fields: { slug: 1 }, options: { unique: true } },
  { fields: { author: 1, createdAt: -1 } },
  { fields: { isDeleted: 1, createdAt: -1 } },
  { fields: { category: 1 } },
];
