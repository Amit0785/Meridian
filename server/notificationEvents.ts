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

export function createNotificationCenter() {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(50);

  const clients = new Map<string, Response>();
  let notificationHistory: INotification[] = [];

  function addClient(id: string, res: Response) {
    clients.set(id, res);
  }

  function removeClient(id: string) {
    clients.delete(id);
  }

  function broadcast(notification: Omit<INotification, 'id' | 'createdAt' | 'read'>) {
    const fullNotification: INotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };

    notificationHistory.unshift(fullNotification);
    if (notificationHistory.length > 50) {
      notificationHistory = notificationHistory.slice(0, 50);
    }

    const payload = `data: ${JSON.stringify(fullNotification)}\n\n`;

    for (const [_, clientRes] of clients.entries()) {
      try {
        clientRes.write(payload);
      } catch (err) {
        // Client disconnected
      }
    }

    return fullNotification;
  }

  function getRecentNotifications(limit = 20): INotification[] {
    return notificationHistory.slice(0, limit);
  }

  return {
    emitter,
    addClient,
    removeClient,
    broadcast,
    getRecentNotifications,
  };
}

export const notificationCenter = createNotificationCenter();
