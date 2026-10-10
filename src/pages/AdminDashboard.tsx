import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAdminData,
  toggleUserRole,
  toggleUserStatus,
  deleteUser,
  restoreTrashPost,
  permanentDeletePost,
  deleteAdminComment,
  clearAdminMessage,
} from '../store/slices/adminSlice';
import {
  AdminStatsCards,
  AdminTabNav,
  AdminDashboardTab,
  AdminAuditLogsTab,
  AdminUsersTab,
  AdminTrashPostsTab,
  AdminCommentsTab,
} from '../components/admin';

interface AdminDashboardProps {
  onSelectPost: (post: Post) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectPost }) => {
  const dispatch = useAppDispatch();
  const {
    stats,
    users,
    trashPosts,
    comments,
    activityLogs,
    loading,
    actionLoading,
    message,
  } = useAppSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('metrics');

  useEffect(() => {
    dispatch(fetchAdminData());
  }, [dispatch]);

  const handleRoleToggle = (userId: string, currentRole: 'admin' | 'user') => {
    dispatch(toggleUserRole({ userId, currentRole }));
  };

  const handleStatusToggle = (userId: string) => {
    dispatch(toggleUserStatus(userId));
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? Their posts will be archived.`)) return;
    dispatch(deleteUser(userId));
  };

  const handleRestorePost = (postId: string) => {
    dispatch(restoreTrashPost(postId));
  };

  const handleHardDeletePost = (postId: string) => {
    if (!confirm('Permanently purge this post and all associated comments from database? This cannot be undone.')) return;
    dispatch(permanentDeletePost(postId));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Remove this comment?')) return;
    dispatch(deleteAdminComment(commentId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Admin Control Console</h2>
          </div>
          <p className="text-xs text-slate-500">
            Role-Based Access Control (RBAC) enforced via server-side middleware · Live Mongoose metrics
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchAdminData())}
          disabled={loading || actionLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => dispatch(clearAdminMessage())} className="font-bold p-1">
            &times;
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <AdminStatsCards stats={stats} />

      {/* Navigation Sub-Tabs */}
      <AdminTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          logs: activityLogs.length,
          users: users.length,
          trashPosts: trashPosts.length,
          comments: comments.length,
        }}
      />

      {/* Tab Panels */}
      {activeTab === 'metrics' && <AdminAuditLogsTab activityLogs={activityLogs} />}

      {activeTab === 'users' && (
        <AdminUsersTab
          users={users}
          actionLoading={actionLoading}
          onToggleRole={handleRoleToggle}
          onToggleStatus={handleStatusToggle}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === 'posts' && (
        <AdminTrashPostsTab
          trashPosts={trashPosts}
          actionLoading={actionLoading}
          onSelectPost={onSelectPost}
          onRestorePost={handleRestorePost}
          onHardDeletePost={handleHardDeletePost}
        />
      )}

      {activeTab === 'comments' && (
        <AdminCommentsTab
          comments={comments}
          actionLoading={actionLoading}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
};
