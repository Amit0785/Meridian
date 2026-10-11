import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUserProps } from "../utils/types";

const userSchema = new mongoose.Schema<IUserProps>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    userRole: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "user"],
        message: "Role must be either 'Admin' or 'User'",
      },
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual alias: allow accessing .role or .userRole interchangeably
userSchema
  .virtual("role")
  .get(function () {
    return this.userRole;
  })
  .set(function (val: "admin" | "user") {
    this.userRole = val;
  });

userSchema
  .virtual("passwordHash")
  .get(function () {
    return this.password;
  })
  .set(function (val: string) {
    this.password = val;
  });

userSchema.pre("save", async function (this: any, next?: any) {
  if (this.isModified("password") && this.password) {
    if (
      !this.password.startsWith("$2a$") &&
      !this.password.startsWith("$2b$")
    ) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  if (typeof next === "function") {
    next();
  }
});

export const User: mongoose.Model<IUserProps> =
  (mongoose.models.User as mongoose.Model<IUserProps>) ||
  mongoose.model<IUserProps>("User", userSchema);
export default User;

// Standalone functions replacing UserModel class
export async function findUserById(id: string): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  const user = await User.findById(id).lean();
  if (!user) return null;
  return {
    ...user,
    passwordHash: (user as any).password,
  };
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return null;
  return {
    ...user,

    passwordHash: (user as any).password,
  };
}

export async function findUserOne(
  filter: Record<string, any>,
): Promise<any | null> {
  const query: Record<string, any> = {};
  for (const [key, val] of Object.entries(filter)) {
    if (key === "role") {
      query.userRole = val;
    } else if (key === "_id" && !mongoose.isValidObjectId(val)) {
      return null;
    } else {
      query[key] = val;
    }
  }
  const user = await User.findOne(query as any).lean();
  if (!user) return null;
  return {
    ...user,
    passwordHash: (user as any).password,
  };
}

export async function findUsers(
  filter: Record<string, any> = {},
): Promise<any[]> {
  const query: Record<string, any> = {};
  for (const [key, val] of Object.entries(filter)) {
    if (key === "role") {
      query.userRole = val;
    } else {
      query[key] = val;
    }
  }
  const users = await User.find(query as any).lean();
  return users.map((user: any) => ({
    ...user,
    passwordHash: user.password,
  }));
}

export async function createUserDoc(data: {
  name: string;
  email: string;
  password?: string;
  userRole?: "admin" | "user";
  avatar?: string;
  provider?: "local" | "google" | "facebook";
}): Promise<any> {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new Error("Email address already registered");
  }

  const plainPassword =
    data.password || Math.random().toString(36).substring(2, 10);

  const createPayload: Record<string, any> = {
    name: data.name,
    email: data.email.toLowerCase(),
    password: plainPassword,
    userRole: data.userRole || "user",
    avatar:
      data.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,

    provider: data.provider || "local",
    status: "active",
  };
  const newUser = await User.create(createPayload);
  const obj =
    typeof (newUser as any).toObject === "function"
      ? (newUser as any).toObject()
      : newUser;
  return {
    ...obj,
    passwordHash: obj.password,
  };
}

export async function updateUserById(
  id: string,
  updates: Record<string, any>,
): Promise<any | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  const queryUpdates = { ...updates };
  if (queryUpdates.role && !queryUpdates.userRole) {
    queryUpdates.userRole = queryUpdates.role;
  }
  if (
    queryUpdates.password &&
    !queryUpdates.password.startsWith("$2a$") &&
    !queryUpdates.password.startsWith("$2b$")
  ) {
    const salt = await bcrypt.genSalt(10);
    queryUpdates.password = await bcrypt.hash(queryUpdates.password, salt);
  }
  const updated = await User.findByIdAndUpdate(
    id,
    queryUpdates as any,
    {
      new: true,
      returnDocument: "after",
    } as any,
  ).lean();
  if (!updated) return null;
  return {
    ...updated,
    passwordHash: (updated as any).password,
  };
}

export async function deleteUserById(id: string): Promise<boolean> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return false;
  }
  const result = await User.findByIdAndDelete(id);
  return !!result;
}

export async function countUsers(
  filter: Record<string, any> = {},
): Promise<number> {
  return User.countDocuments(filter as any);
}

export async function compareUserPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function sanitizeUser(user: any) {
  if (!user) return null;
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.__v;

  return sanitized;
}

// Plain function dictionary for backward compatibility (no class)
export const UserModel = {
  findById: findUserById,
  findOne: findUserOne,
  find: findUsers,
  create: createUserDoc,
  findByIdAndUpdate: updateUserById,
  findByIdAndDelete: deleteUserById,
  countDocuments: countUsers,
  comparePassword: compareUserPassword,
  sanitize: sanitizeUser,
};

export const userModel = UserModel;
