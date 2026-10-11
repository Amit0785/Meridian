import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";
import { instance, instance1, API, Storage } from "../../lib/api";
import { auth as firebaseAuth, firebaseSignOut } from "../../lib/firebase";

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

const initialToken = Storage.getItem("token");
const initialRefreshToken = Storage.getItem("refresh-token");

const initialState: AuthState = {
  user: null,
  isAdmin: false,
  isAuthenticated: !!initialToken,
  isLoading: true,
  error: null,
  token: initialToken,
  refreshToken: initialRefreshToken,
};

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = Storage.getItem("token");
      if (!token) return null;

      const res = await instance.get(API.auth.me);
      console.log("fetchCurrentUser response:", res.data.data);
      if (res.data?.success && res.data?.data?.user) {
        return res.data.data.user as User;
      }
      return null;
    } catch (err: any) {
      Storage.removeItem("token");
      Storage.removeItem("refresh-token");
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch current user",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, pass }: { email: string; pass: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await instance1.post(API.auth.login, {
        email,
        password: pass,
      });
      const { data } = res;
      if (data?.success && data?.data) {
        console.log("Login successful:", data.data);
        const { user, tokens } = data.data;
        Storage.setItem("token", tokens.accessToken);
        Storage.setItem("refresh-token", tokens.refreshToken);
        return {
          user: user as User,
          token: tokens.accessToken as string,
          refreshToken: tokens.refreshToken as string,
        };
      }
      return rejectWithValue("Login failed");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Login failed",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    data: {
      name: string;
      email: string;
      password: string;
      userRole?: "admin" | "user";
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await instance1.post(API.auth.register, data);
      const resData = res.data;
      if (resData?.success && resData?.data) {
        const { user, tokens } = resData.data;
        Storage.setItem("token", tokens.accessToken);
        Storage.setItem("refresh-token", tokens.refreshToken);
        return {
          user: user as User,
          token: tokens.accessToken as string,
          refreshToken: tokens.refreshToken as string,
        };
      }
      return rejectWithValue("Registration failed");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Registration failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await instance.post(API.auth.logout);
  } catch {
    // Ignore network error on logout
  } finally {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch {
      // Ignore
    }
    Storage.removeItem("token");
    Storage.removeItem("refresh-token");
  }
  return null;
});

export const socialLoginUser = createAsyncThunk(
  "auth/socialLoginUser",
  async (
    payload: {
      provider: "google" | "facebook";
      name?: string;
      email?: string;
      token?: string;
      avatar?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { provider, name, email, token } = payload;
      const avatar =
        payload.avatar ||
        (provider === "google"
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "google")}`
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || "facebook")}`);

      const res = await instance1.post(API.auth.socialLogin, {
        provider,
        name,
        email,
        token,
        avatar,
      });

      const resData = res.data;
      if (resData?.success && (resData?.data || resData?.tokens)) {
        const user = resData.data?.user || resData.user;
        const tokens = resData.data?.tokens || resData.tokens;
        const accessToken =
          tokens?.accessToken || resData.accessToken || resData.token;
        const refreshToken = tokens?.refreshToken || resData.refreshToken;

        if (accessToken) {
          Storage.setItem("token", accessToken);
        }
        if (refreshToken) {
          Storage.setItem("refresh-token", refreshToken);
        }

        return {
          user: user as User,
          token: accessToken as string,
          refreshToken: refreshToken as string,
        };
      }
      return rejectWithValue("Social sign-in failed");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Social sign-in failed",
      );
    }
  },
);

export const switchDemoRole = createAsyncThunk(
  "auth/switchDemoRole",
  async (target: "admin" | "user" | "writer", { dispatch }) => {
    if (target === "admin") {
      return dispatch(
        loginUser({ email: "admin@meridian.dev", pass: "admin123" }),
      ).unwrap();
    } else if (target === "user") {
      return dispatch(
        loginUser({ email: "julian@meridian.dev", pass: "password123" }),
      ).unwrap();
    } else {
      return dispatch(
        loginUser({ email: "maya@meridian.dev", pass: "password123" }),
      ).unwrap();
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setToken: (
      state,
      action: PayloadAction<{ token?: string; refreshToken?: string }>,
    ) => {
      if (action.payload.token) {
        state.token = action.payload.token;
        Storage.setItem("token", action.payload.token);
      }
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        Storage.setItem("refresh-token", action.payload.refreshToken);
      }
      state.isAuthenticated = !!state.token;
    },
    logoutRequest: (state) => {
      try {
        firebaseSignOut(firebaseAuth).catch(() => {});
      } catch {
        // Ignore
      }
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isLoading = false;
      state.error = null;
      Storage.removeItem("token");
      Storage.removeItem("refresh-token");
    },
  },
  extraReducers: (builder) => {
    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<User | null>) => {
          console.log("fetchCurrentUser fulfilled:", action.payload);
          state.isLoading = false;
          state.user = action.payload;
          state.isAuthenticated = !!action.payload;
          state.isAdmin = action.payload?.userRole === "admin";
          state.error = null;
        },
      )
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      });

    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.userRole === "admin";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Authentication failed";
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.userRole === "admin";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Registration failed";
      });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isLoading = false;
      state.error = null;
    });

    // socialLoginUser
    builder
      .addCase(socialLoginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(socialLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.userRole === "admin";
        state.error = null;
      })
      .addCase(socialLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Social login failed";
      });
  },
});

export const { clearAuthError, setToken, logoutRequest } = authSlice.actions;
export default authSlice.reducer;
