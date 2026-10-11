import React, { useState, useEffect } from "react";
import { Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchComments,
  addComment,
  updateComment,
  removeComment,
} from "../store/slices/postsSlice";
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Check,
  X,
  Shield,
} from "lucide-react";

interface CommentSectionProps {
  postId: string;
  onOpenAuth: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onOpenAuth,
}) => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const {
    comments,
    commentsLoading: loading,
    commentsError,
  } = useAppSelector((state) => state.posts);

  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || commentsError;

  useEffect(() => {
    if (postId) {
      dispatch(fetchComments(postId));
    }
  }, [dispatch, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setSubmitting(true);
      setLocalError(null);
      const res = await api.post(`/comments/post/${postId}`, {
        content: newContent.trim(),
      });
      if (res.success && res.data) {
        dispatch(addComment(res.data));
        setNewContent("");
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/comments/${commentId}`, {
        content: editContent.trim(),
      });
      if (res.success && res.data) {
        dispatch(updateComment(res.data));
        setEditingId(null);
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to update comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      dispatch(removeComment(commentId));
    } catch (err: any) {
      setLocalError(err.message || "Failed to delete comment");
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <span>Discussion ({comments.length})</span>
        </h4>
        <span className="text-xs text-slate-500 font-mono">
          Mongoose Post-Comment Reference
        </span>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-slate-50 p-4 rounded-xl border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`
              }
              alt={user?.name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full border border-slate-200 object-cover"
            />
            <span className="text-xs font-semibold text-slate-800">
              Commenting as {user?.name}
            </span>
            {user?.userRole === "admin" && (
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> ADMIN
              </span>
            )}
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share your technical perspective or ask a question..."
            rows={3}
            className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400"
            required
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newContent.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <p className="text-sm text-slate-600 mb-3">
            Sign in to participate in the technical discussion and engage with
            the author.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Sign In to Comment</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
            >
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = user && user._id === comment.author._id;
            const canManage = isAuthor || isAdmin;
            const isEditing = editingId === comment._id;

            return (
              <div
                key={comment._id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        comment.author.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.author.name)}`
                      }
                      alt={comment.author.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {comment.author.name}
                        </span>
                        {comment.author.userRole === "admin" && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1 py-0.2 rounded font-semibold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(comment._id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {isAuthor && (
                            <button
                              onClick={() => handleStartEdit(comment)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Edit comment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title={
                              isAdmin && !isAuthor
                                ? "Admin delete"
                                : "Delete comment"
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full text-sm bg-white border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed pl-9">
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
