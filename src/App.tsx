import { Bell, X } from "lucide-react";
import { shallowEqual } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ApiDocsModal } from "./components/ApiDocsModal";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { PostEditorModal } from "./components/PostEditorModal";
import { TestRunnerModal } from "./components/TestRunnerModal";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  NotificationProvider,
  useNotifications,
} from "./context/NotificationContext";
import { AppRoutes } from "./routes";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setEditingPost } from "./store/slices/postsSlice";
import {
  setApiDocsOpen,
  setAuthOpen,
  setNewPostOpen,
  setNotificationsOpen,
  setTestRunnerOpen,
} from "./store/slices/uiSlice";

function MainApp() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { activeToast, dismissToast } = useNotifications();

  // Redux UI State
  const { isAuthOpen, isApiDocsOpen, isTestRunnerOpen, isNotificationsOpen } =
    useAppSelector((state) => state.ui, shallowEqual);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenNewPost={() => {
          if (!isAuthenticated) {
            dispatch(setAuthOpen(true));
          } else {
            dispatch(setEditingPost(null));
            dispatch(setNewPostOpen(true));
          }
        }}
        onOpenAuth={() => dispatch(setAuthOpen(true))}
        onOpenApiDocs={() => dispatch(setApiDocsOpen(true))}
        onOpenTestRunner={() => dispatch(setTestRunnerOpen(true))}
        onOpenNotifications={() => dispatch(setNotificationsOpen(true))}
      />

      {/* Main Viewport Content Driven by React Router */}
      <main className="flex-1">
        <AppRoutes />
      </main>

      {/* Real-time Toast Popup */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                {activeToast.title}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {activeToast.message}
              </div>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <Footer
        onOpenApiDocs={() => dispatch(setApiDocsOpen(true))}
        onOpenTestRunner={() => dispatch(setTestRunnerOpen(true))}
      />

      {/* Modals & Drawers */}
      <PostEditorModal />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => dispatch(setAuthOpen(false))}
      />
      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => dispatch(setApiDocsOpen(false))}
      />
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => dispatch(setTestRunnerOpen(false))}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => dispatch(setNotificationsOpen(false))}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
