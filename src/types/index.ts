export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  bio?: string;
  status: 'active' | 'suspended';
  provider?: 'local' | 'google' | 'facebook';
  createdAt: string;
  updatedAt: string;
  postsCount?: number;
  commentsCount?: number;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'user';
  };
  isDeleted: boolean;
  deletedAt?: string | null;
  views: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'user';
  };
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  postTitle?: string;
  postSlug?: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  targetType: 'post' | 'comment' | 'user' | 'auth' | 'system';
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PlatformStats {
  overview: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    totalPosts: number;
    publishedPosts: number;
    deletedPosts: number;
    totalComments: number;
    totalViews: number;
  };
}

export interface TestResultItem {
  id: string;
  testType: 'Unit' | 'Integration';
  name: string;
  description: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  assertionDetails?: string;
}

export interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  results: TestResultItem[];
}

export interface NotificationItem {
  id: string;
  type: 'comment' | 'post' | 'system' | 'admin';
  title: string;
  message: string;
  targetUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
