import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PlatformStats, User, Post, ActivityLog, Comment } from '../../types';
import { api } from '../../lib/api';

export interface AdminState {
  stats: PlatformStats | null;
  users: User[];
  trashPosts: Post[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  message: { type: 'success' | 'error'; text: string } | null;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  trashPosts: [],
  comments: [],
  activityLogs: [],
  loading: false,
  actionLoading: false,
  error: null,
  message: null,
};

export const fetchAdminData = createAsyncThunk(
  'admin/fetchAdminData',
  async (_, { rejectWithValue }) => {
    try {
      const [statsRes, usersRes, trashRes, commentsRes, logsRes] = await Promise.all([
        api.get<PlatformStats>('/admin/stats'),
        api.get<User[]>('/admin/users'),
        api.get<Post[]>('/admin/trash-posts'),
        api.get<Comment[]>('/comments/all'),
        api.get<ActivityLog[]>('/admin/activity-logs'),
      ]);

      return {
        stats: statsRes.success ? statsRes.data : null,
        users: usersRes.success ? usersRes.data : [],
        trashPosts: trashRes.success ? trashRes.data : [],
        comments: commentsRes.success ? commentsRes.data : [],
        activityLogs: logsRes.success ? logsRes.data : [],
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to load admin dashboard data'
      );
    }
  }
);

export const toggleUserRole = createAsyncThunk(
  'admin/toggleUserRole',
  async (
    { userId, currentRole }: { userId: string; currentRole: 'admin' | 'user' },
    { dispatch, rejectWithValue }
  ) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      dispatch(fetchAdminData());
      return `Updated user role to ${newRole.toUpperCase()}`;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update user role'
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      dispatch(fetchAdminData());
      return res.message || 'User status updated';
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update user status'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      dispatch(fetchAdminData());
      return 'User deleted and articles moved to trash';
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to delete user'
      );
    }
  }
);

export const restoreTrashPost = createAsyncThunk(
  'admin/restoreTrashPost',
  async (postId: string, { dispatch, rejectWithValue }) => {
    try {
      await api.patch(`/posts/${postId}/restore`);
      dispatch(fetchAdminData());
      return 'Post restored back to public publication feed';
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to restore post'
      );
    }
  }
);

export const permanentDeletePost = createAsyncThunk(
  'admin/permanentDeletePost',
  async (postId: string, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}/permanent`);
      dispatch(fetchAdminData());
      return 'Post permanently purged from database';
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to delete post'
      );
    }
  }
);

export const deleteAdminComment = createAsyncThunk(
  'admin/deleteAdminComment',
  async (commentId: string, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`);
      dispatch(fetchAdminData());
      return 'Comment moderated and deleted';
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to delete comment'
      );
    }
  }
);

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminMessage: (
      state,
      action: PayloadAction<{ type: 'success' | 'error'; text: string } | null>
    ) => {
      state.message = action.payload;
    },
    clearAdminMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAdminData
    builder
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.users = action.payload.users;
        state.trashPosts = action.payload.trashPosts;
        state.comments = action.payload.comments;
        state.activityLogs = action.payload.activityLogs;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load admin data';
        state.message = {
          type: 'error',
          text: (action.payload as string) || 'Failed to load admin dashboard data',
        };
      });

    // Mutations - common pending/fulfilled/rejected patterns
    const mutations = [
      toggleUserRole,
      toggleUserStatus,
      deleteUser,
      restoreTrashPost,
      permanentDeletePost,
      deleteAdminComment,
    ];

    for (const m of mutations) {
      builder
        .addCase(m.pending, (state) => {
          state.actionLoading = true;
        })
        .addCase(m.fulfilled, (state, action) => {
          state.actionLoading = false;
          if (action.payload) {
            state.message = { type: 'success', text: action.payload as string };
          }
        })
        .addCase(m.rejected, (state, action) => {
          state.actionLoading = false;
          state.message = {
            type: 'error',
            text: (action.payload as string) || 'Admin operation failed',
          };
        });
    }
  },
});

export const { setAdminMessage, clearAdminMessage } = adminSlice.actions;
export default adminSlice.reducer;
