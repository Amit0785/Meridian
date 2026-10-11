export interface IUserProps {
  _id?: any;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  userRole?: "admin" | "user";
  avatar?: string;
  provider?: "local" | "google" | "facebook";
  status?: "active" | "suspended";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IPostProps {
  _id?: any;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: any;
  isDeleted?: boolean;
  deletedAt?: Date | string | null;
  views?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICommentProps {
  _id?: any;
  postId: any;
  author: any;
  content: string;
  isDeleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IActivityLogProps {
  _id?: any;
  action: string;
  resource: string;
  userId?: any;
  userEmail?: string | null;
  details?: string;
  ip?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
