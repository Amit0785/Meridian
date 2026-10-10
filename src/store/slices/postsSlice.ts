import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, Pagination } from '../../types';
import { instance, instance1, instance2, API } from '../../lib/api';

export interface PostsState {
  posts: Post[];
  selectedPost: Post | null;
  editingPost: Post | null;
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  selectedPost: null,
  editingPost: null,
  categories: ['All'],
  selectedCategory: 'All',
  searchQuery: '',
  pagination: null,
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (
    options: { page?: number; limit?: number; category?: string; search?: string; authorId?: string; includeDeleted?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.category && options.category !== 'All') params.append('category', options.category);
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
  async ({ id, postData }: { id: string; postData: any }, { rejectWithValue }) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && postData instanceof FormData;
      const axiosClient = isFormData ? instance2 : instance;
      const res = await axiosClient.put(`${API.posts.base}/${id}`, postData);
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
      if (data?.success && data?.data?.categories) {
        return data.data.categories as string[];
      }
      return ['All'];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch categories');
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
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
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
      state.categories = action.payload;
    });
  },
});

export const {
  setSelectedPost,
  setEditingPost,
  setSelectedCategory,
  setSearchQuery,
} = postsSlice.actions;

export default postsSlice.reducer;
