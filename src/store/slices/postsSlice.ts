import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Post, Pagination, Comment } from "../../types";
import { instance, instance1, instance2, API } from "../../lib/api";

export interface PostsState {
  posts: Post[];
  myPosts: Post[];
  myPostsLoading: boolean;
  myPostsError: string | null;
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

export const defaultPagination: Pagination = {
  page: 1,
  limit: 6,
  totalCount: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const initialState: PostsState = {
  posts: [],
  myPosts: [],
  myPostsLoading: false,
  myPostsError: null,
  selectedPost: null,
  editingPost: null,
  tags: ["All"],
  searchQuery: "",
  pagination: defaultPagination,
  loading: false,
  error: null,
  comments: [],
  commentsLoading: false,
  commentsError: null,
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (
    options: {
      page?: number;
      limit?: number;
      search?: string;
      authorId?: string;
      includeDeleted?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.search && options.search.trim())
        params.append("search", options.search.trim());
      if (options.authorId) params.append("authorId", options.authorId);
      if (options.includeDeleted) params.append("includeDeleted", "true");

      const res = await instance1.get(`${API.posts.base}?${params.toString()}`);
      const data = res.data;
      if (data?.success) {
        return {
          posts: data.data as Post[],
          pagination: data.pagination as Pagination,
        };
      }
      return rejectWithValue("Failed to fetch posts");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch posts",
      );
    }
  },
);

export const fetchMyPosts = createAsyncThunk(
  "posts/fetchMyPosts",
  async (
    arg: { authorId?: string; limit?: number } | string | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as any;
      const authorId =
        (typeof arg === "string" ? arg : arg?.authorId) ||
        state.auth?.user?._id;

      if (!authorId) {
        return rejectWithValue("User not authenticated");
      }

      const limit = typeof arg === "object" && arg?.limit ? arg.limit : 50;
      const res = await instance.get(
        `${API.posts.base}?authorId=${encodeURIComponent(authorId)}&includeDeleted=true&limit=${limit}`,
      );
      const data = res.data;
      if (data?.success && Array.isArray(data.data)) {
        return data.data as Post[];
      }
      return rejectWithValue("Failed to fetch my posts");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch my posts",
      );
    }
  },
);

export const fetchPostBySlug = createAsyncThunk(
  "posts/fetchPostBySlug",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const res = await instance1.get(`${API.posts.base}/${identifier}`);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue("Post not found");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Post not found",
      );
    }
  },
);

export const createPostThunk = createAsyncThunk(
  "posts/createPostThunk",
  async (postData: any, { rejectWithValue }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && postData instanceof FormData;
      const axiosClient = isFormData ? instance2 : instance;
      const res = await axiosClient.post(API.posts.base, postData);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue("Failed to create post");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create post",
      );
    }
  },
);

export const updatePostThunk = createAsyncThunk(
  "posts/updatePostThunk",
  async (
    { id, postData }: { id: string; postData: any },
    { rejectWithValue },
  ) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && postData instanceof FormData;
      const axiosClient = isFormData ? instance2 : instance;
      const res = await axiosClient.patch(`${API.posts.base}/${id}`, postData);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue("Failed to update post");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update post",
      );
    }
  },
);

export const softDeletePostThunk = createAsyncThunk(
  "posts/softDeletePostThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await instance.delete(`${API.posts.base}/${id}`);
      if (res.data?.success) {
        return id;
      }
      return rejectWithValue("Failed to delete post");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete post",
      );
    }
  },
);

export const restorePostThunk = createAsyncThunk(
  "posts/restorePostThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await instance.patch(`${API.posts.base}/${id}/restore`);
      const data = res.data;
      if (data?.success && data?.data) {
        return data.data as Post;
      }
      return rejectWithValue("Failed to restore post");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to restore post",
      );
    }
  },
);

export const permanentDeletePostThunk = createAsyncThunk(
  "posts/permanentDeletePostThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await instance.delete(`${API.posts.base}/${id}/permanent`);
      if (res.data?.success) {
        return id;
      }
      return rejectWithValue("Failed to permanently delete post");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to permanently delete post",
      );
    }
  },
);

export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
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
        err.response?.data?.message || err.message || "Failed to load comments",
      );
    }
  },
);

export const postsSlice = createSlice({
  name: "posts",
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
    setPage: (state, action: PayloadAction<number>) => {
      if (state.pagination) {
        state.pagination.page = action.payload;
      }
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(
        (c) => c._id === action.payload._id,
      );
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter((c) => c._id !== action.payload);
    },
    setMyPosts: (state, action: PayloadAction<Post[]>) => {
      state.myPosts = action.payload;
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
        state.error = (action.payload as string) || "Failed to fetch posts";
      });

    // fetchMyPosts
    builder
      .addCase(fetchMyPosts.pending, (state) => {
        state.myPostsLoading = true;
        state.myPostsError = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.myPostsLoading = false;
        state.myPosts = action.payload;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.myPostsLoading = false;
        state.myPostsError =
          (action.payload as string) || "Failed to fetch my posts";
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
        state.error = (action.payload as string) || "Post not found";
      });

    // createPostThunk
    builder.addCase(createPostThunk.fulfilled, (state, action) => {
      state.posts.unshift(action.payload);
      state.myPosts.unshift(action.payload);
      state.selectedPost = action.payload;
    });

    // updatePostThunk
    builder.addCase(updatePostThunk.fulfilled, (state, action) => {
      const index = state.posts.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      const myIndex = state.myPosts.findIndex(
        (p) => p._id === action.payload._id,
      );
      if (myIndex !== -1) {
        state.myPosts[myIndex] = action.payload;
      }
      if (state.selectedPost?._id === action.payload._id) {
        state.selectedPost = action.payload;
      }
    });

    // softDeletePostThunk
    builder.addCase(softDeletePostThunk.fulfilled, (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
      const myPost = state.myPosts.find((p) => p._id === action.payload);
      if (myPost) {
        myPost.isDeleted = true;
      }
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
      const myIndex = state.myPosts.findIndex(
        (p) => p._id === action.payload._id,
      );
      if (myIndex !== -1) {
        state.myPosts[myIndex] = action.payload;
      }
      if (state.selectedPost?._id === action.payload._id) {
        state.selectedPost = action.payload;
      }
    });

    // permanentDeletePostThunk
    builder.addCase(permanentDeletePostThunk.fulfilled, (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
      state.myPosts = state.myPosts.filter((p) => p._id !== action.payload);
      if (state.selectedPost?._id === action.payload) {
        state.selectedPost = null;
      }
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
        state.commentsError =
          (action.payload as string) || "Failed to load comments";
      });
  },
});

export const {
  setSelectedPost,
  setEditingPost,
  setSearchQuery,
  setPage,
  setPagination,
  setComments,
  addComment,
  updateComment,
  removeComment,
  setMyPosts,
} = postsSlice.actions;

export default postsSlice.reducer;
