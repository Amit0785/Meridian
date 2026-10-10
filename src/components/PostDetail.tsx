import React, { useState } from 'react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './CommentSection';
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Share2, 
  Bookmark, 
  Check, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  onRestore: (post: Post) => void;
  onPermanentDelete?: (post: Post) => void;
  onOpenAuth: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onOpenAuth,
}) => {
  const { user, isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const isOwner = user && user._id === post.author._id;
  const canModify = isOwner || isAdmin;

  const wordCount = post.content.split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown renderer
  const renderMarkdown = (content: string) => {
    const paragraphs = content.split('\n\n');

    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl font-bold text-slate-900 mt-8 mb-4">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-lg font-bold text-slate-900 mt-6 mb-3">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('```')) {
        const codeLines = trimmed.split('\n').filter(line => !line.startsWith('```'));
        return (
          <div key={idx} className="my-6 rounded-xl bg-slate-900 text-slate-100 p-5 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
            <pre>
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-slate-700 text-base leading-relaxed pl-2">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-slate-700 text-base leading-relaxed pl-2">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }

      return (
        <p key={idx} className="text-slate-700 text-base leading-relaxed my-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Publications</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Share article link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${
              bookmarked ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : 'text-slate-600'
            }`}
            title="Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {canModify && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              {post.isDeleted ? (
                <>
                  <button
                    onClick={() => onRestore(post)}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Post</span>
                  </button>
                  {isAdmin && onPermanentDelete && (
                    <button
                      onClick={() => onPermanentDelete(post)}
                      className="flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(post)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(post)}
                    className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Trash</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trash notice if deleted */}
      {post.isDeleted && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              This post was soft-deleted on{' '}
              {post.deletedAt ? new Date(post.deletedAt).toLocaleString() : 'recently'}. It is hidden from standard queries.
            </span>
          </div>
          {canModify && (
            <button
              onClick={() => onRestore(post)}
              className="px-3 py-1 bg-white border border-rose-300 font-semibold text-rose-700 rounded-lg hover:bg-rose-100 transition-colors shrink-0"
            >
              Restore to Live
            </button>
          )}
        </div>
      )}

      {/* Zero-Pill Header Metadata */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <span className="font-semibold text-slate-900">{post.category}</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{readTimeMin} min read</span>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span className="tabular-nums font-mono">{post.views} views</span>
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Excerpt Lead */}
      <p className="text-lg text-slate-600 font-normal leading-relaxed mb-8 border-b border-slate-100 pb-6">
        {post.excerpt}
      </p>

      {/* Author Strip */}
      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <img
          src={post.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author.name)}`}
          alt={post.author.name}
          referrerPolicy="no-referrer"
          className="w-12 h-12 rounded-full border border-slate-200 object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="font-bold text-slate-900 text-sm">{post.author.name}</h5>
            {post.author.role === 'admin' && (
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded font-semibold">
                ADMIN
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>
              Published{' '}
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-400 truncate">
              slug: /{post.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="prose max-w-none text-slate-800 leading-relaxed font-sans">
        {renderMarkdown(post.content)}
      </div>

      {/* Tags (Zero-Pill: subtle clean textual links) */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Tags:
          </span>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Discussion & Comments Section */}
      <CommentSection postId={post._id} onOpenAuth={onOpenAuth} />
    </article>
  );
};
