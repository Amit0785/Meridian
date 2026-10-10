import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, Pagination, Comment } from '../../types';
import { instance, instance1, instance2, API } from '../../lib/api';

export interface PostsState {
  posts: Post[];
  selectedPost: Post | null;
  editingPost: Post | null;
  tags: string[];
  searchQuery: string;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;
}

const initialState: PostsState = {
  posts: [],
  selectedPost: null,
  editingPost: null,
  tags: ['All'],
  searchQuery: '',
  pagination: null,
  loading: false,
  error: null,
  comments: [],
  commentsLoading: false,
  commentsError: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (
    options: { page?: number; limit?: number; search?: string; authorId?: string; includeDeleted?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.authorId) params.append('authorId', options.authorId);
      if (options.includeDeleted) params.append('includeDeleted', 'true');

      const res = await instance1.get(`${API.posts.base}?${params.toString()}`);
      const data = res.data;
      if (data?.success) {
        return {
          posts: data.data as Post[],
          pagination: data.pagination as Pagination,
        };
      }
      return rejectWithValue('Failed to fetch posts');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchPostBySlug',
  async (identifier: string, { rejectWithValue }) => {
    try {
      const res = await instance1.get(`${API.posts.base}/${identifier}`);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue('Post not found');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Post not found');
    }
  }
);

export const createPostThunk = createAsyncThunk(
  'posts/createPostThunk',
  async (postData: any, { rejectWithValue }) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && postData instanceof FormData;
      const axiosClient = isFormData ? instance2 : instance;
      const res = await axiosClient.post(API.posts.base, postData);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue('Failed to create post');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create post');
    }
  }
);

export const updatePostThunk = createAsyncThunk(
  'posts/updatePostThunk',
  async (
    { id, postData }: { id: string; postData: any },
    { rejectWithValue }
  ) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && postData instanceof FormData;
      const axiosClient = isFormData ? instance2 : instance;
      const res = await axiosClient.patch(`${API.posts.base}/${id}`, postData);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue('Failed to update post');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update post');
    }
  }
);

export const softDeletePostThunk = createAsyncThunk(
  'posts/softDeletePostThunk',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await instance.delete(`${API.posts.base}/${id}`);
      if (res.data?.success) {
        return id;
      }
      return rejectWithValue('Failed to delete post');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete post');
    }
  }
);

export const restorePostThunk = createAsyncThunk(
  'posts/restorePostThunk',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await instance.patch(`${API.posts.base}/${id}/restore`);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue('Failed to restore post');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to restore post');
    }
  }
);

export const permanentDeletePostThunk = createAsyncThunk(
  'posts/permanentDeletePostThunk',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await instance.delete(`${API.posts.base}/${id}/permanent`);
      if (res.data?.success) {
        return id;
      }
      return rejectWithValue('Failed to permanently delete post');
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to permanently delete post');
    }
  }
);

export const fetchTaxonomy = createAsyncThunk(
  'posts/fetchTaxonomy',
  async (_, { rejectWithValue }) => {
    try {
      const res = await instance1.get(API.posts.taxonomy);
      const data = res.data;
      if (data?.success && data?.data?.tags) {
        return data.data.tags as string[];
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch tags');
    }
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await instance1.get(`${API.comments.base}/post/${postId}`);
      const data = res.data;
      if (data?.success && Array.isArray(data.data)) {
        return data.data as Comment[];
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to load comments'
      );
    }
  }
);

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedPost: (state, action: PayloadAction<Post | null>) => {
      state.selectedPost = action.payload;
    },
    setEditingPost: (state, action: PayloadAction<Post | null>) => {
      state.editingPost = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter((c) => c._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // fetchPosts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch posts';
      });

    // fetchPostBySlug
    builder
      .addCase(fetchPostBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Post not found';
      });

    // createPostThunk
    builder.addCase(createPostThunk.fulfilled, (state, action) => {
      state.posts.unshift(action.payload);
      state.selectedPost = action.payload;
    });

    // updatePostThunk
    builder.addCase(updatePostThunk.fulfilled, (state, action) => {
      const index = state.posts.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.selectedPost?._id === action.payload._id) {
        state.selectedPost = action.payload;
      }
    });

    // softDeletePostThunk
    builder.addCase(softDeletePostThunk.fulfilled, (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
      if (state.selectedPost?._id === action.payload) {
        state.selectedPost = null;
      }
    });

    // restorePostThunk
    builder.addCase(restorePostThunk.fulfilled, (state, action) => {
      const index = state.posts.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.selectedPost?._id === action.payload._id) {
        state.selectedPost = action.payload;
      }
    });

    // permanentDeletePostThunk
    builder.addCase(permanentDeletePostThunk.fulfilled, (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
      if (state.selectedPost?._id === action.payload) {
        state.selectedPost = null;
      }
    });

    // fetchTaxonomy
    builder.addCase(fetchTaxonomy.fulfilled, (state, action) => {
      state.tags = ['All', ...action.payload];
    });

    // fetchComments
    builder
      .addCase(fetchComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = (action.payload as string) || 'Failed to load comments';
      });
  },
});

export const {
  setSelectedPost,
  setEditingPost,
  setSearchQuery,
  setComments,
  addComment,
  updateComment,
  removeComment,
} = postsSlice.actions;

export default postsSlice.reducer;
