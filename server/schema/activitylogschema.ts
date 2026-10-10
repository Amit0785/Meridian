import mongoose from "mongoose";

export interface IActivityLogDocument {
  _id: any;
  action: string;
  userId?: any;
  userEmail?: string;
  targetType: "post" | "comment" | "user" | "auth" | "system";
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLogDocument>(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: {
      type: String,
    },
    targetType: {
      type: String,
      enum: {
        values: ["post", "comment", "user", "auth", "system"],
        message: "Invalid target type",
      },
      required: [true, "Target type is required"],
    },
    targetId: {
      type: String,
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

activityLogSchema.index({ createdAt: -1 });

export const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLogDocument>("ActivityLog", activityLogSchema);
export default ActivityLog;

// Standalone functions replacing ActivityLogModel class
export async function logActivityDoc(data: {
  action: string;
  userId?: any;
  userEmail?: string;
  targetType: "post" | "comment" | "user" | "auth" | "system";
  targetId?: string;
  details: string;
  ipAddress?: string;
  _id?: any;
}): Promise<any> {
  const logPayload: Record<string, any> = {
    action: data.action,
    userId:
      data.userId && mongoose.isValidObjectId(data.userId)
        ? data.userId
        : undefined,
    userEmail: data.userEmail,
    targetType: data.targetType,
    targetId: data.targetId,
    details: data.details,
    ipAddress: data.ipAddress,
  };

  if (data._id) {
    logPayload._id = data._id;
  }

  const newLog = await ActivityLog.create(logPayload);
  return newLog.toObject();
}

export async function findLatestActivityLogs(limit = 50): Promise<any[]> {
  return ActivityLog.find().sort({ createdAt: -1 }).limit(limit).lean();
}

// Plain function dictionary for backward compatibility (no class)
export const ActivityLogModel = {
  log: logActivityDoc,
  findLatest: findLatestActivityLogs,
  findRecent: findLatestActivityLogs,
};
