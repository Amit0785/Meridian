import React from 'react';
import { Post } from '../../types';
import { ExternalLink, RotateCcw, Trash2 } from 'lucide-react';

interface AdminTrashPostsTabProps {
  trashPosts: Post[];
  actionLoading: boolean;
  onSelectPost: (post: Post) => void;
  onRestorePost: (postId: string) => void;
  onHardDeletePost: (postId: string) => void;
}

export const AdminTrashPostsTab: React.FC<AdminTrashPostsTabProps> = ({
  trashPosts,
  actionLoading,
  onSelectPost,
  onRestorePost,
  onHardDeletePost,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Archived &amp; Soft-Deleted Publications</h4>
          <p className="text-xs text-slate-500">
            Posts preserved with <code>isDeleted: true</code> flag. Can be restored or permanently removed.
          </p>
        </div>
        <span className="font-mono text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg">
          {trashPosts.length} posts in trash
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {trashPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No soft-deleted posts in the trash. All publications are currently active!
          </div>
        ) : (
          trashPosts.map((p) => (
            <div
              key={p._id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{p.title}</span>
                  <span className="text-slate-400 font-mono text-[11px]">/{p.slug}</span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-2">
                  <span>Author: {p.author.name}</span>
                  <span>·</span>
                  <span className="text-rose-600 font-semibold">
                    Deleted: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'Yes'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectPost(p)}
                  className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => onRestorePost(p._id)}
                  disabled={actionLoading}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                  title="Restore post back to public feed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => onHardDeletePost(p._id)}
                  disabled={actionLoading}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                  title="Permanent database purge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
