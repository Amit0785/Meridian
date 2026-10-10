import { dbStore, IActivityLogDoc } from '../config/database';

export class ActivityLogModel {
  static async log(data: {
    action: string;
    userId?: string;
    userEmail?: string;
    targetType: 'post' | 'comment' | 'user' | 'auth' | 'system';
    targetId?: string;
    details: string;
    ipAddress?: string;
  }): Promise<IActivityLogDoc> {
    const newLog: IActivityLogDoc = {
      _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action: data.action,
      userId: data.userId,
      userEmail: data.userEmail,
      targetType: data.targetType,
      targetId: data.targetId,
      details: data.details,
      ipAddress: data.ipAddress,
      createdAt: new Date().toISOString(),
    };

    dbStore.activityLogs.unshift(newLog);
    // Keep max 200 logs
    if (dbStore.activityLogs.length > 200) {
      dbStore.activityLogs = dbStore.activityLogs.slice(0, 200);
    }
    return newLog;
  }

  static async findLatest(limit = 50): Promise<IActivityLogDoc[]> {
    return dbStore.activityLogs.slice(0, limit);
  }

  static async findRecent(limit = 50): Promise<IActivityLogDoc[]> {
    return ActivityLogModel.findLatest(limit);
  }
}

export const ActivityLogSchema = ActivityLogModel;
