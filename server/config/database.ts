import dns from "node:dns";

import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    console.log("✅ MongoDB Connected");
    console.log("Ready State:", mongoose.connection.readyState);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  }
};


/**
 * Disconnect MongoDB cleanly
 */
export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();

    isConnected = false;
    console.log("[MongoDB] Disconnected from MongoDB");
  }
}



export interface IUserDoc {
  _id: any;
  name: string;
  email: string;
  passwordHash?: string;
  role: "admin" | "user";
  userRole?: "admin" | "user";
  avatar?: string;
  bio?: string;
  provider?: "local" | "google" | "facebook";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export interface IPostDoc {
  _id: any;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: any; // User ID reference
  isDeleted: boolean;
  deletedAt?: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentDoc {
  _id: any;
  postId: any; // Post ID reference
  author: any; // User ID reference
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLogDoc {
  _id: any;
  action: string;
  userId?: any;
  userEmail?: string;
  targetType: "post" | "comment" | "user" | "auth" | "system";
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}








