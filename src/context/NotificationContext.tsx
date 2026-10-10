import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotificationHistory,
  setNotificationsList,
  addNotificationItem,
  markAllNotificationsRead,
  clearNotificationItem,
  dismissToast as dismissToastAction,
} from '../store/slices/notificationsSlice';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  activeToast: NotificationItem | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, activeToast } = useAppSelector((state) => state.notifications);

  // Fetch initial history via Redux thunk
  useEffect(() => {
    dispatch(fetchNotificationHistory());
  }, [dispatch]);

  // Connect to SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/notifications/stream');

      eventSource.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          if (item && item.id) {
            dispatch(addNotificationItem(item));

            // Auto dismiss toast after 5s
            setTimeout(() => {
              dispatch(dismissToastAction());
            }, 5000);
          }
        } catch {
          // Heartbeat or malformed payload
        }
      };
    } catch {
      // EventSource fallback
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [dispatch]);

  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  const clearNotification = useCallback((id: string) => {
    dispatch(clearNotificationItem(id));
  }, [dispatch]);

  const dismissToast = useCallback(() => {
    dispatch(dismissToastAction());
  }, [dispatch]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotification,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
