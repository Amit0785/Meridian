import React, { createContext, useContext, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import {
  auth as firebaseAuth,
  firebaseSignOut,
  createGoogleProvider,
  createfacebookProvider,
} from "../lib/firebase";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  socialLoginUser,
  switchDemoRole,
} from "../store/slices/authSlice";
import { clearAllNotifications } from "../store/slices/notificationsSlice";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
  }) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (payload: {
    provider: "google" | "facebook";
    name?: string;
    email?: string;
    token?: string;
    avatar?: string;
  }) => Promise<void>;
  signInWithSocialFirebase: (provider: "google" | "facebook") => Promise<{
    success: boolean;
    cancelled?: boolean;
    requiresChooser?: boolean;
  }>;
  switchDemoAccount: (target: "admin" | "user" | "writer") => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAdmin, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const login = async (email: string, pass: string) => {
    await dispatch(loginUser({ email, pass })).unwrap();
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
    bio?: string;
  }) => {
    await dispatch(registerUser(data)).unwrap();
  };

  const logout = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    dispatch(clearAllNotifications());
    await dispatch(logoutUser()).unwrap();
  };

  const socialLogin = async (payload: {
    provider: "google" | "facebook";
    name?: string;
    email?: string;
    token?: string;
    avatar?: string;
  }) => {
    await dispatch(socialLoginUser(payload)).unwrap();
  };

  const signInWithSocialFirebase = async (
    provider: "google" | "facebook",
  ): Promise<{
    success: boolean;
    cancelled?: boolean;
    requiresChooser?: boolean;
  }> => {
    // 1. Explicitly clear any existing Firebase auth session so it never persists across sign-ins
    try {
      await firebaseSignOut(firebaseAuth);
    } catch {
      // ignore
    }
    // Initiate interactive sign-in for the selected provider.
    try {
      const authProvider =
        provider === "google"
          ? createGoogleProvider()
          : createfacebookProvider();
      const userCredential = await signInWithPopup(firebaseAuth, authProvider);
      const idToken = await userCredential.user.getIdToken();
      const firebaseUser = userCredential.user;

      await dispatch(
        socialLoginUser({
          provider,
          token: idToken,
          email: firebaseUser.email || undefined,
          name: firebaseUser.displayName || undefined,
          avatar: firebaseUser.photoURL || undefined,
        }),
      ).unwrap();

      return { success: true };
    } catch (firebaseErr: any) {
      const errCode = firebaseErr?.code || "";
      console.warn(
        `Firebase ${provider} Auth popup response:`,
        errCode || firebaseErr?.message,
      );

      if (
        errCode === "auth/popup-closed-by-user" ||
        errCode === "auth/cancelled-popup-request" ||
        errCode === "auth/user-cancelled"
      ) {
        // User deliberately closed or cancelled provider account selection.
        return { success: false, cancelled: true };
      }

      // If popup was blocked or domain not allowed in preview environment:
      // Request user account selection rather than picking any profile automatically!
      return { success: false, requiresChooser: true };
    }
  };

  const switchDemoAccount = async (target: "admin" | "user" | "writer") => {
    await dispatch(switchDemoRole(target)).unwrap();
  };

  const refreshUser = async () => {
    await dispatch(fetchCurrentUser()).unwrap();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        socialLogin,
        signInWithSocialFirebase,
        switchDemoAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
