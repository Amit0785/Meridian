import React, { createContext, useContext, useEffect, useCallback, SetStateAction, Dispatch } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotificationHistory,
  setNotificationsList,
  addNotificationItem,
  markAllNotificationsRead,
  clearNotificationItem,
  clearAllNotifications,
  dismissToast as dismissToastAction,
} from '../store/slices/notificationsSlice';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  setNotificationsList: Dispatch<SetStateAction<NotificationItem[]>>;
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  activeToast: NotificationItem | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, activeToast } = useAppSelector((state) => state.notifications);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch history when user is authenticated, clear on logout
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotificationHistory());
    } else {
      dispatch(clearAllNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Connect to SSE stream only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated, dispatch]);

  const setNotificationsListHandler: Dispatch<SetStateAction<NotificationItem[]>> = useCallback(
    (action) => {
      if (typeof action === 'function') {
        dispatch(setNotificationsList(action(notifications)));
      } else {
        dispatch(setNotificationsList(action));
      }
    },
    [dispatch, notifications]
  );

  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  const clearNotification = useCallback((id: string) => {
    dispatch(clearNotificationItem(id));
  }, [dispatch]);

  const clearAllNotificationsHandler = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  const dismissToast = useCallback(() => {
    dispatch(dismissToastAction());
  }, [dispatch]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotificationsList: setNotificationsListHandler,
        unreadCount,
        markAllAsRead,
        clearNotification,
        clearAllNotifications: clearAllNotificationsHandler,
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
