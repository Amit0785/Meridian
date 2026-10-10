import React from 'react';
import { Activity, Users, Trash2, MessageSquare } from 'lucide-react';

export type AdminDashboardTab = 'metrics' | 'users' | 'posts' | 'comments';

interface AdminTabNavProps {
  activeTab: AdminDashboardTab;
  onTabChange: (tab: AdminDashboardTab) => void;
  counts: {
    logs: number;
    users: number;
    trashPosts: number;
    comments: number;
  };
}

export const AdminTabNav: React.FC<AdminTabNavProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
      <button
        onClick={() => onTabChange('metrics')}
        className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
          activeTab === 'metrics'
            ? 'border-indigo-600 text-indigo-600 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <Activity className="w-3.5 h-3.5" />
        <span>Audit Logs ({counts.logs})</span>
      </button>

      <button
        onClick={() => onTabChange('users')}
        className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
          activeTab === 'users'
            ? 'border-indigo-600 text-indigo-600 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        <span>User Management ({counts.users})</span>
      </button>

      <button
        onClick={() => onTabChange('posts')}
        className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
          activeTab === 'posts'
            ? 'border-indigo-600 text-indigo-600 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Post Management &amp; Trash ({counts.trashPosts} archived)</span>
      </button>

      <button
        onClick={() => onTabChange('comments')}
        className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
          activeTab === 'comments'
            ? 'border-indigo-600 text-indigo-600 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Comment Moderation ({counts.comments})</span>
      </button>
    </div>
  );
};
