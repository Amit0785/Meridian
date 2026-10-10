import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Shield,
  User as UserIcon,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    login,
    register,
    signInWithSocialFirebase,
    switchDemoAccount,
  } = useAuth();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Account Chooser state
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowGoogleChooser(false);

    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === "signin") {
        await login(email, password);
      } else {
        await register({ name, email, password, role });
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: "google" | "facebook") => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithSocialFirebase(provider);
      if (provider === "google" && res.requiresChooser) {
        setShowGoogleChooser(true);
        return;
      }
      if (res.cancelled) {
        return;
      }
      if (res.success) {
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || "Social authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (target: "admin" | "user" | "writer") => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoAccount(target);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              {showGoogleChooser
                ? "Sign in with Google"
                : tab === "signin"
                  ? "Welcome Back"
                  : "Create Meridian Account"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {showGoogleChooser
                ? "Choose an account to continue to Meridian"
                : "Secure JWT authentication with bcrypt salted hashing"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <>
          {/* Tab switcher */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setError(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                tab === "signin"
                  ? "bg-white text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                tab === "register"
                  ? "bg-white text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* 1-Click Quick Demo Switcher */}
          <div className="px-6 pt-5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Evaluator Roles:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("admin")}
                  className="py-1.5 px-2.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-lg text-slate-800 font-medium transition-colors text-left flex items-center justify-between"
                >
                  <span>Admin Eleanor</span>
                  <Shield className="w-3 h-3 text-indigo-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("user")}
                  className="py-1.5 px-2.5 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg text-slate-800 font-medium transition-colors text-left flex items-center justify-between"
                >
                  <span>User Julian</span>
                  <UserIcon className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Social Authentication Buttons */}
          <div className="px-6 space-y-2 mb-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocial("google")}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocial("facebook")}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2 text-[11px] text-slate-400 uppercase tracking-wider absolute">
                or credentials
              </span>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Patel"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            {tab === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "user")}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="user">
                    Regular User (Can manage own posts)
                  </option>
                  <option value="admin">
                    Admin (Can manage all users, posts, comments)
                  </option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : tab === "signin"
                  ? "Sign In to Meridian"
                  : "Create Account"}
            </button>
          </form>
        </>
      </div>
    </div>
  );
};
