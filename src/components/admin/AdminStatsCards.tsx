import React from 'react';
import { PlatformStats } from '../../types';
import { Users, FileText, MessageSquare, Eye } from 'lucide-react';

interface AdminStatsCardsProps {
  stats: PlatformStats | null;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-slate-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Users
          </span>
          <Users className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
          {stats?.overview.totalUsers ?? 0}
        </div>
        <div className="text-[11px] text-slate-500">
          <span className="font-semibold text-slate-800">
            {stats?.overview.adminUsers ?? 0}
          </span>{' '}
          Admins ·{' '}
          <span className="font-semibold text-slate-800">
            {stats?.overview.regularUsers ?? 0}
          </span>{' '}
          Regular Users
        </div>
      </div>

      {/* Total Posts */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-slate-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Posts
          </span>
          <FileText className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
          {stats?.overview.totalPosts ?? 0}
        </div>
        <div className="text-[11px] text-slate-500">
          <span className="font-semibold text-emerald-700">
            {stats?.overview.publishedPosts ?? 0}
          </span>{' '}
          Active ·{' '}
          <span className="font-semibold text-rose-700">
            {stats?.overview.deletedPosts ?? 0}
          </span>{' '}
          Soft-Deleted (Trash)
        </div>
      </div>

      {/* Total Comments */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-slate-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Comments
          </span>
          <MessageSquare className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
          {stats?.overview.totalComments ?? 0}
        </div>
        <div className="text-[11px] text-slate-500">
          Relational post-comment reference trees
        </div>
      </div>

      {/* Total Views */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-slate-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Post Views
          </span>
          <Eye className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
          {stats?.overview.totalViews ?? 0}
        </div>
        <div className="text-[11px] text-slate-500">
          Aggregated reading traffic
        </div>
      </div>
    </div>
  );
};
