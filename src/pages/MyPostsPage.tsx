import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "../types";
import { useAuth } from "../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSelectedPost,
  setEditingPost,
  softDeletePostThunk,
  restorePostThunk,
  fetchMyPosts,
} from "../store/slices/postsSlice";
import { setNewPostOpen, setAuthOpen } from "../store/slices/uiSlice";
import { PostCard } from "../components/PostCard";
import { PenSquare, FileText } from "lucide-react";
import { shallowEqual } from "react-redux";

export const MyPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { myPosts: posts, myPostsLoading: loading } = useAppSelector(
    (state) => state.posts,
    shallowEqual,
  );
  const [filter, setFilter] = useState<"all" | "active" | "trash">("all");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchMyPosts(user._id));
    }
  }, [dispatch, user?._id]);

  const handleSelectPost = (post: Post) => {
    dispatch(setSelectedPost(post));
    navigate(`/posts/${encodeURIComponent(post.slug || post._id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditPost = (post: Post) => {
    dispatch(setEditingPost(post));
    dispatch(setNewPostOpen(true));
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to move "${post.title}" to trash?`))
      return;
    try {
      await dispatch(softDeletePostThunk(post._id)).unwrap();
      if (user?._id) {
        dispatch(fetchMyPosts(user._id));
      }
    } catch (err: any) {
      alert(err.message || "Failed to soft delete post");
    }
  };

  const handleRestorePost = async (post: Post) => {
    try {
      await dispatch(restorePostThunk(post._id)).unwrap();
      if (user?._id) {
        dispatch(fetchMyPosts(user._id));
      }
    } catch (err: any) {
      alert(err.message || "Failed to restore post");
    }
  };

  const handleOpenNewPost = () => {
    dispatch(setEditingPost(null));
    dispatch(setNewPostOpen(true));
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          You must sign in to view and manage your publications.
        </p>
        <button
          onClick={() => dispatch(setAuthOpen(true))}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  const filteredPosts = useMemo(() => posts.filter((p) => {
    if (filter === "active") return !p.isDeleted;
    if (filter === "trash") return p.isDeleted;
    return true;
  }), [posts, filter]);

  const activeCount = useMemo(() => posts.filter((p) => !p.isDeleted).length, [posts])
  const trashCount = useMemo(() => posts.filter((p) => p.isDeleted).length, [posts])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            My Publications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your published articles and soft-deleted drafts (
            {activeCount} active · {trashCount} archived)
          </p>
        </div>

        <button
          onClick={handleOpenNewPost}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>Write Story</span>
        </button>
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md transition-colors ${filter === "all"
            ? "bg-white text-slate-900 shadow-xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          All ({posts.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 rounded-md transition-colors ${filter === "active"
            ? "bg-white text-slate-900 shadow-xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter("trash")}
          className={`px-3 py-1.5 rounded-md transition-colors ${filter === "trash"
            ? "bg-white text-slate-900 shadow-xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          Trash ({trashCount})
        </button>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-slate-200 rounded-xl p-6 h-56 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-5 bg-slate-200 rounded w-4/5 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              No stories found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {filter === "trash"
                ? "Your trash is completely empty."
                : "You have not written any publications yet."}
            </p>
          </div>
          {filter !== "trash" && (
            <button
              onClick={handleOpenNewPost}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Your First Article</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onSelect={() => handleSelectPost(post)}
              onEdit={() => handleEditPost(post)}
              onDelete={() => handleDeletePost(post)}
              onRestore={() => handleRestorePost(post)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
