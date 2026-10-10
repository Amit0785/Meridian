import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationItem } from '../../types';
import { instance } from '../../lib/api';

export interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  activeToast: NotificationItem | null;
  loading: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  activeToast: null,
  loading: false,
};

export const fetchNotificationHistory = createAsyncThunk(
  'notifications/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await instance.get('/notifications/history');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data as NotificationItem[];
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch notifications');
    }
  }
);

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsList: (state, action: PayloadAction<NotificationItem[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addNotificationItem: (state, action: PayloadAction<NotificationItem>) => {
      state.notifications = [action.payload, ...state.notifications.filter((n) => n.id !== action.payload.id)];
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
      state.activeToast = action.payload;
    },
    markAllNotificationsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    clearNotificationItem: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
    dismissToast: (state) => {
      state.activeToast = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotificationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotificationHistory.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setNotificationsList,
  addNotificationItem,
  markAllNotificationsRead,
  clearNotificationItem,
  dismissToast,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
