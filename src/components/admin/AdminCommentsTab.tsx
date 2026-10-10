import React from 'react';
import { Comment } from '../../types';
import { Trash2 } from 'lucide-react';

interface AdminCommentsTabProps {
  comments: Comment[];
  actionLoading: boolean;
  onDeleteComment: (commentId: string) => void;
}

export const AdminCommentsTab: React.FC<AdminCommentsTabProps> = ({
  comments,
  actionLoading,
  onDeleteComment,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100">
        <h4 className="font-bold text-slate-900 text-sm">Universal Comment Moderation</h4>
        <p className="text-xs text-slate-500">
          Admins have permission to moderate and remove any comment across all publications
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {comments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No comments available for moderation.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{c.author.name}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{c.author.email}</span>
                  <span className="text-slate-300">on</span>
                  <span className="text-indigo-600 font-medium truncate max-w-xs">
                    {c.postTitle || 'Post'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{c.content}</p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => onDeleteComment(c._id)}
                disabled={actionLoading}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Moderate and delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
