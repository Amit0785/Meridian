import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { setToken, logoutRequest } from '../store/slices/authSlice';

export const BASE_URL = import.meta.env?.VITE_API_URL || '/api/v1';

// Web-compatible NetInfo implementation
export const NetInfo = {
  fetch: async () => ({
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
  }),
};

// Storage helper for persistence
export const Storage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// API Endpoint Constants
export const API = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    socialLogin: '/auth/social-login',
  },
  posts: {
    base: '/posts',
    taxonomy: '/posts/taxonomy',
  },
  comments: {
    base: '/comments',
  },
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    trashPosts: '/admin/trash-posts',
    activityLogs: '/admin/activity-logs',
  },
};

// Instance 1: Default Authenticated JSON Axios Instance
export const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance 1 (instance1): Unauthenticated / Public JSON Axios Instance
export const instance1 = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance 2 (instance2): Multipart / Form-Data Axios Instance
export const instance2 = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Token Refresh Logic with deduplication lock
let refreshPromise: Promise<string | null> | null = null;

export const refreshToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const performRefresh = async (): Promise<string | null> => {
    const { auth } = API;

    const authState = store.getState().auth;
    const token = authState.token || Storage.getItem('meridian_access_token') || Storage.getItem('token');
    const rToken = authState.refreshToken || Storage.getItem('meridian_refresh_token') || Storage.getItem('refresh-token');

    if (!rToken) {
      return null;
    }

    try {
      const response = await axios.post(`${BASE_URL}${auth.refreshToken}`, {
        accessToken: token,
        refreshToken: rToken,
      });

      const { status, data } = response;
      const tokens = data?.data?.tokens || data?.tokens;
      const newAccessToken = tokens?.accessToken || data?.data?.accessToken || data?.accessToken;
      const newRefreshToken = tokens?.refreshToken || data?.data?.refreshToken || data?.refreshToken;

      if (status === 200 && newAccessToken) {
        // Dispatch action to update tokens in Redux store
        store.dispatch(
          setToken({
            token: newAccessToken,
            refreshToken: newRefreshToken || rToken,
          })
        );

        // Persist in storage
        Storage.setItem('token', newAccessToken);
        Storage.setItem('meridian_access_token', newAccessToken);
        if (newRefreshToken) {
          Storage.setItem('refresh-token', newRefreshToken);
          Storage.setItem('meridian_refresh_token', newRefreshToken);
        }

        return newAccessToken;
      }

      return null;
    } catch {
      // Session has expired or token is invalid; clear tokens cleanly without uncaught errors
      store.dispatch(logoutRequest());
      Storage.removeItem('token');
      Storage.removeItem('refresh-token');
      Storage.removeItem('meridian_access_token');
      Storage.removeItem('meridian_refresh_token');
      return null;
    } finally {
      refreshPromise = null;
    }
  };

  refreshPromise = performRefresh();
  return refreshPromise;
};

// Request Interceptor: instance (Default Authenticated JSON)
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    throw new axios.Cancel('No internet connection. Please connect to the internet.');
  }

  const { token } = store.getState().auth;
  const activeToken = token || Storage.getItem('token') || Storage.getItem('meridian_access_token');

  if (activeToken && config.headers) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }

  return config;
});

// Request Interceptor: instance2 (Multipart / Form-Data)
instance2.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    throw new axios.Cancel('No internet connection. Please connect to the internet.');
  }

  const { token } = store.getState().auth;
  const activeToken = token || Storage.getItem('token') || Storage.getItem('meridian_access_token');

  if (activeToken && config.headers) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }

  return config;
});

// Request Interceptor: instance1 (Unauthenticated JSON)
instance1.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    throw new axios.Cancel('No internet connection. Please connect to the internet.');
  }

  return config;
});

// Response Interceptor: instance (Auto Token Refresh & Retry on 401)
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/social-login');

    // Check if error is due to expired token and request hasn't been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const newToken = await refreshToken();

        if (newToken) {
          // Update defaults and request headers
          instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Retry original request
          return instance(originalRequest);
        }
      } catch {
        // Ignored; reject below with original error
      }
    }

    return Promise.reject(error);
  }
);

// High-level API response envelope
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  pagination?: any;
  error?: {
    code?: string;
    details?: any;
  };
}

// Convenience wrapper maintaining compatibility with existing codebase
export function createApiClient() {
  function getAccessToken(): string | null {
    const fromStore = store.getState().auth.token;
    return fromStore || Storage.getItem('token') || Storage.getItem('meridian_access_token');
  }

  function getRefreshToken(): string | null {
    const fromStore = store.getState().auth.refreshToken;
    return fromStore || Storage.getItem('refresh-token') || Storage.getItem('meridian_refresh_token');
  }

  function setTokens(access: string, refresh: string) {
    Storage.setItem('token', access);
    Storage.setItem('refresh-token', refresh);
    Storage.setItem('meridian_access_token', access);
    Storage.setItem('meridian_refresh_token', refresh);
    store.dispatch(setToken({ token: access, refreshToken: refresh }));
  }

  function clearTokens() {
    Storage.removeItem('token');
    Storage.removeItem('refresh-token');
    Storage.removeItem('meridian_access_token');
    Storage.removeItem('meridian_refresh_token');
    store.dispatch(logoutRequest());
  }

  async function get<T = any>(endpoint: string, config?: any): Promise<ApiResponse<T>> {
    const res = await instance.get<ApiResponse<T>>(endpoint, config);
    return res.data;
  }

  async function post<T = any>(endpoint: string, body?: any, config?: any): Promise<ApiResponse<T>> {
    const res = await instance.post<ApiResponse<T>>(endpoint, body, config);
    return res.data;
  }

  async function put<T = any>(endpoint: string, body?: any, config?: any): Promise<ApiResponse<T>> {
    const res = await instance.put<ApiResponse<T>>(endpoint, body, config);
    return res.data;
  }

  async function patch<T = any>(endpoint: string, body?: any, config?: any): Promise<ApiResponse<T>> {
    const res = await instance.patch<ApiResponse<T>>(endpoint, body, config);
    return res.data;
  }

  async function del<T = any>(endpoint: string, config?: any): Promise<ApiResponse<T>> {
    const res = await instance.delete<ApiResponse<T>>(endpoint, config);
    return res.data;
  }

  return {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}

export const api = createApiClient();
export default instance;
