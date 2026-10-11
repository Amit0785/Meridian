import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Post } from "../types";
import { useAuth } from "../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSelectedPost,
  setEditingPost,
  fetchPostBySlug,
  softDeletePostThunk,
  restorePostThunk,
  permanentDeletePostThunk,
} from "../store/slices/postsSlice";
import { setNewPostOpen, setAuthOpen } from "../store/slices/uiSlice";
import { PostDetail } from "../components/PostDetail";

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { selectedPost, loading } = useAppSelector((state) => state.posts);

  useEffect(() => {
    if (slug) {
      if (!selectedPost || (selectedPost.slug !== slug && selectedPost._id !== slug)) {
        dispatch(fetchPostBySlug(slug));
      }
    }
  }, [slug, selectedPost, dispatch]);

  const handleBack = () => {
    dispatch(setSelectedPost(null));
    navigate("/");
  };

  const handleEdit = (post: Post) => {
    dispatch(setEditingPost(post));
    dispatch(setNewPostOpen(true));
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`Are you sure you want to move "${post.title}" to trash?`))
      return;
    try {
      await dispatch(softDeletePostThunk(post._id)).unwrap();
      navigate("/");
    } catch (err: any) {
      alert(err.message || "Failed to soft delete post");
    }
  };

  const handleRestore = async (post: Post) => {
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
      navigate("/");
    } catch (err: any) {
      alert(err.message || "Failed to permanently delete post");
    }
  };

  const handleOpenAuth = () => {
    dispatch(setAuthOpen(true));
  };

  if (loading && !selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-mono">Loading publication...</p>
      </div>
    );
  }

  if (!selectedPost) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Publication Not Found
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          The requested article could not be located or may have been removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          Return to Publications
        </button>
      </div>
    );
  }

  return (
    <PostDetail
      post={selectedPost}
      onBack={handleBack}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRestore={handleRestore}
      onPermanentDelete={handlePermanentDelete}
      onOpenAuth={handleOpenAuth}
    />
  );
};

export default PostDetailPage;
