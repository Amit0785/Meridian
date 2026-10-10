import bcrypt from "bcryptjs";
import { dbStore, IUserDoc } from "../config/database";

export interface IUserSchema extends IUserDoc {
  password?: string;
  toObject?: () => Record<string, any>;
}

function wrapUserDoc(user: IUserDoc): IUserSchema {
  const userObj: IUserSchema = {
    ...user,
    password: user.passwordHash,
  };
  userObj.toObject = function () {
    return {
      ...this,
      password: this.passwordHash,
    };
  };
  return userObj;
}

export class UserModel {
  static async findById(id: string): Promise<IUserSchema | null> {
    const user = dbStore.users.find((u) => u._id === id);
    return user ? wrapUserDoc(user) : null;
  }

  static async findOne(
    filter: Partial<IUserDoc> & Record<string, any>,
  ): Promise<IUserSchema | null> {
    const user = dbStore.users.find((u) => {
      for (const [key, val] of Object.entries(filter)) {
        if (key === "userRole") {
          if (u.role !== val) return false;
          continue;
        }
        if ((u as any)[key] !== val) return false;
      }
      return true;
    });
    return user ? wrapUserDoc(user) : null;
  }

  static async find(filter: Partial<IUserDoc> = {}): Promise<IUserSchema[]> {
    return dbStore.users
      .filter((u) => {
        for (const [key, val] of Object.entries(filter)) {
          if ((u as any)[key] !== val) return false;
        }
        return true;
      })
      .map((u) => wrapUserDoc(u));
  }

  static async create(data: {
    name: string;
    email: string;
    password?: string;
    role?: "admin" | "user";
    avatar?: string;
    bio?: string;
    provider?: "local" | "google" | "facebook";
  }): Promise<IUserDoc> {
    const existing = await this.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error("Email address already registered");
    }

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : await bcrypt.hash(Math.random().toString(36), 10);

    const newUser: IUserDoc = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || "user",
      avatar:
        data.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      bio: data.bio || "",
      provider: data.provider || "local",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.users.push(newUser);
    dbStore.save();
    return { ...newUser };
  }

  static async findByIdAndUpdate(
    id: string,
    updates: Partial<IUserDoc>,
  ): Promise<IUserDoc | null> {
    const index = dbStore.users.findIndex((u) => u._id === id);
    if (index === -1) return null;

    dbStore.users[index] = {
      ...dbStore.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    dbStore.save();

    return { ...dbStore.users[index] };
  }

  static async findByIdAndDelete(id: string): Promise<boolean> {
    const index = dbStore.users.findIndex((u) => u._id === id);
    if (index === -1) return false;

    dbStore.users.splice(index, 1);
    dbStore.save();
    return true;
  }

  static async countDocuments(filter: Partial<IUserDoc> = {}): Promise<number> {
    const users = await this.find(filter);
    return users.length;
  }

  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  static sanitize(user: IUserDoc) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

export const UserSchema = UserModel;
export const userModel = UserModel;

/**
 * Mongoose Schema Indexes definition for query optimization:
 * - email: unique index for fast authentication lookup and preventing duplicate accounts
 * - role: index for RBAC queries
 * - status: index for active/suspended moderation checks
 */
export const UserMongooseIndexes = [
  { fields: { email: 1 }, options: { unique: true } },
  { fields: { role: 1 } },
  { fields: { status: 1 } },
];
