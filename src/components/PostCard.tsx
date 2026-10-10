import React from 'react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { Eye, Edit3, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onRestore?: (post: Post) => void;
  featured?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  featured = false,
}) => {
  const { user, isAdmin } = useAuth();
  const isOwner = user && user._id === post.author._id;
  const canModify = isOwner || isAdmin;

  // Approximate reading time
  const wordCount = post.content.split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      onClick={() => onSelect(post)}
      className={`group relative bg-white border rounded-xl transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
        post.isDeleted
          ? 'border-rose-200 bg-rose-50/20 opacity-80'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
      } ${featured ? 'md:col-span-2' : ''}`}
    >
      <div className="p-6">
        {/* Soft-Delete Warning Banner */}
        {post.isDeleted && (
          <div className="mb-3 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Soft-deleted {post.deletedAt ? new Date(post.deletedAt).toLocaleDateString() : ''} (Hidden from public)</span>
          </div>
        )}

        {/* Clean Unboxed Metadata with Typographic Separators (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="font-semibold text-slate-800">{post.category}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{readTimeMin} min read</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{formattedDate}</span>
        </div>

        {/* Article Title */}
        <h3
          className={`font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors mb-2.5 ${
            featured ? 'text-2xl md:text-3xl' : 'text-lg leading-snug'
          }`}
          style={{ textWrap: 'balance' }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">
          {post.excerpt}
        </p>
      </div>

      {/* Footer Info: Author & Interaction Metrics */}
      <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author.name)}`}
            alt={post.author.name}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full border border-slate-200 object-cover shrink-0"
          />
          <div className="truncate">
            <span className="text-xs font-semibold text-slate-800 truncate block">
              {post.author.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1 font-mono tabular-nums">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.views}</span>
          </span>

          {/* Quick Action Buttons */}
          {canModify && (
            <div
              className="flex items-center gap-1 border-l border-slate-200 pl-2.5"
              onClick={e => e.stopPropagation()}
            >
              {post.isDeleted && onRestore ? (
                <button
                  onClick={() => onRestore(post)}
                  title="Restore soft-deleted post"
                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(post)}
                      title="Edit article"
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(post)}
                      title="Move to trash (Soft delete)"
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
