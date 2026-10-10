import { EventEmitter } from 'events';
import { Response } from 'express';

export interface INotification {
  id: string;
  type: 'comment' | 'post' | 'system' | 'admin';
  title: string;
  message: string;
  targetUrl?: string;
  createdAt: string;
  read: boolean;
}

class NotificationCenter extends EventEmitter {
  private clients: Map<string, Response> = new Map();
  private notificationHistory: INotification[] = [];

  constructor() {
    super();
    this.setMaxListeners(50);
  }

  addClient(id: string, res: Response) {
    this.clients.set(id, res);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  broadcast(notification: Omit<INotification, 'id' | 'createdAt' | 'read'>) {
    const fullNotification: INotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };

    this.notificationHistory.unshift(fullNotification);
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }

    const payload = `data: ${JSON.stringify(fullNotification)}\n\n`;

    for (const [_, clientRes] of this.clients.entries()) {
      try {
        clientRes.write(payload);
      } catch (err) {
        // Client might have disconnected
      }
    }

    return fullNotification;
  }

  getRecentNotifications(limit = 20): INotification[] {
    return this.notificationHistory.slice(0, limit);
  }
}

export const notificationCenter = new NotificationCenter();
