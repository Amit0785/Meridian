import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  NotificationProvider,
  useNotifications,
} from "./context/NotificationContext";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  setCurrentTab,
  setNewPostOpen,
  setAuthOpen,
  setApiDocsOpen,
  setTestRunnerOpen,
  setNotificationsOpen,
  setDemoGuideOpen,
} from "./store/slices/uiSlice";
import {
  setSelectedPost,
  setEditingPost,
  createPostThunk,
  updatePostThunk,
  softDeletePostThunk,
  restorePostThunk,
  permanentDeletePostThunk,
  fetchPostBySlug,
} from "./store/slices/postsSlice";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { MyPostsPage } from "./pages/MyPostsPage";
import { PostDetail } from "./components/PostDetail";
import { PostEditorModal } from "./components/PostEditorModal";
import { AuthModal } from "./components/AuthModal";
import { ApiDocsModal } from "./components/ApiDocsModal";
import { TestRunnerModal } from "./components/TestRunnerModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { DemoGuideModal } from "./components/DemoGuideModal";
import { Post } from "./types";
import { X, Bell } from "lucide-react";
import { shallowEqual } from "react-redux";

function MainApp() {
  const dispatch = useAppDispatch();
  const { user, isAdmin, isAuthenticated, switchDemoAccount } = useAuth();
  const { activeToast, dismissToast } = useNotifications();

  // Redux UI State
  const {
    currentTab,
    isNewPostOpen,
    isAuthOpen,
    isApiDocsOpen,
    isTestRunnerOpen,
    isNotificationsOpen,
    isDemoGuideOpen,
  } = useAppSelector((state) => state.ui, shallowEqual);

  // Redux Posts State
  const { selectedPost, editingPost } = useAppSelector(
    (state) => state.posts,
    shallowEqual,
  );

  const handleSelectPost = async (post: Post) => {
    try {
      await dispatch(fetchPostBySlug(post.slug || post._id)).unwrap();
    } catch {
      dispatch(setSelectedPost(post));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigatePostBySlug = async (slug: string) => {
    try {
      await dispatch(fetchPostBySlug(slug)).unwrap();
    } catch (err) {
      console.warn("Navigation error:", err);
    }
  };

  const handleSavePost = async (postData: any) => {
    if (editingPost) {
      await dispatch(
        updatePostThunk({ id: editingPost._id, postData }),
      ).unwrap();
    } else {
      await dispatch(createPostThunk(postData)).unwrap();
    }
    dispatch(setEditingPost(null));
    dispatch(setNewPostOpen(false));
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to move "${post.title}" to trash?`))
      return;
    try {
      await dispatch(softDeletePostThunk(post._id)).unwrap();
    } catch (err: any) {
      alert(err.message || "Failed to soft delete post");
    }
  };

  const handleRestorePost = async (post: Post) => {
    try {
      await dispatch(restorePostThunk(post._id)).unwrap();
    } catch (err: any) {
      alert(err.message || "Failed to restore post");
    }
  };

  const handlePermanentDelete = async (post: Post) => {
    if (
      !confirm(`Permanently remove "${post.title}" and comments from database?`)
    )
      return;
    try {
      await dispatch(permanentDeletePostThunk(post._id)).unwrap();
    } catch (err: any) {
      alert(err.message || "Failed to permanently delete post");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          dispatch(setSelectedPost(null));
          dispatch(setCurrentTab(tab));
        }}
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
        onOpenDemoGuide={() => dispatch(setDemoGuideOpen(true))}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {selectedPost ? (
          <PostDetail
            post={selectedPost}
            onBack={() => dispatch(setSelectedPost(null))}
            onEdit={(p) => {
              dispatch(setEditingPost(p));
              dispatch(setNewPostOpen(true));
            }}
            onDelete={handleDeletePost}
            onRestore={handleRestorePost}
            onPermanentDelete={handlePermanentDelete}
            onOpenAuth={() => dispatch(setAuthOpen(true))}
          />
        ) : currentTab === "admin" ? (
          isAdmin ? (
            <AdminDashboard onSelectPost={handleSelectPost} />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Restricted Admin Area
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                You must possess an Administrator role to access system
                statistics, user moderation, and trash recovery.
              </p>
              <button
                onClick={() => dispatch(setAuthOpen(true))}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Sign In with Admin Account
              </button>
            </div>
          )
        ) : currentTab === "my-posts" ? (
          <MyPostsPage
            onSelectPost={handleSelectPost}
            onEditPost={(p) => {
              dispatch(setEditingPost(p));
              dispatch(setNewPostOpen(true));
            }}
            onDeletePost={handleDeletePost}
            onRestorePost={handleRestorePost}
            onOpenNewPost={() => {
              dispatch(setEditingPost(null));
              dispatch(setNewPostOpen(true));
            }}
          />
        ) : (
          <HomePage
            onSelectPost={handleSelectPost}
            onEditPost={(p) => {
              dispatch(setEditingPost(p));
              dispatch(setNewPostOpen(true));
            }}
            onDeletePost={handleDeletePost}
            onRestorePost={handleRestorePost}
            onOpenNewPost={() => {
              if (!isAuthenticated) {
                dispatch(setAuthOpen(true));
              } else {
                dispatch(setEditingPost(null));
                dispatch(setNewPostOpen(true));
              }
            }}
          />
        )}
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

      {/* Post Editor Modal */}
      <PostEditorModal
        isOpen={isNewPostOpen}
        onClose={() => {
          dispatch(setNewPostOpen(false));
          dispatch(setEditingPost(null));
        }}
        onSubmit={handleSavePost}
        initialData={editingPost}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => dispatch(setAuthOpen(false))}
      />

      {/* API Documentation Modal */}
      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => dispatch(setApiDocsOpen(false))}
      />

      {/* Interactive Unit & Integration Test Console */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => dispatch(setTestRunnerOpen(false))}
      />

      {/* 5-10 Min Demo Video Showcase Guide */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => dispatch(setDemoGuideOpen(false))}
        onOpenAdmin={() => {
          dispatch(setCurrentTab("admin"));
          dispatch(setSelectedPost(null));
        }}
        onOpenTestRunner={() => dispatch(setTestRunnerOpen(true))}
        onSwitchDemo={(role) => switchDemoAccount(role)}
      />

      {/* Notification Stream Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => dispatch(setNotificationsOpen(false))}
        onNavigatePost={handleNavigatePostBySlug}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
