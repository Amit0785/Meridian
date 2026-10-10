import React, { useState, useEffect, useCallback } from 'react';
import { PlatformStats, User, Post, ActivityLog, Comment } from '../types';
import { api } from '../lib/api';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Eye, 
  Trash2, 
  RotateCcw, 
  Shield, 
  UserCheck, 
  UserX, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectPost: (post: Post) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectPost }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [trashPosts, setTrashPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'posts' | 'comments'>('metrics');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, trashRes, commentsRes, logsRes] = await Promise.all([
        api.get<PlatformStats>('/admin/stats'),
        api.get<User[]>('/admin/users'),
        api.get<Post[]>('/admin/trash-posts'),
        api.get<Comment[]>('/comments/all'),
        api.get<ActivityLog[]>('/admin/activity-logs'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (trashRes.success) setTrashPosts(trashRes.data);
      if (commentsRes.success) setComments(commentsRes.data);
      if (logsRes.success) setActivityLogs(logsRes.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load admin dashboard data' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleRoleToggle = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      setActionLoading(true);
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setMessage({ type: 'success', text: `Updated user role to ${newRole.toUpperCase()}` });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update user role' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/users/${userId}/status`);
      setMessage({ type: 'success', text: res.message || 'User status updated' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update user status' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? Their posts will be archived.`)) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/users/${userId}`);
      setMessage({ type: 'success', text: 'User deleted and articles moved to trash' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete user' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestorePost = async (postId: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/posts/${postId}/restore`);
      setMessage({ type: 'success', text: 'Post restored back to public publication feed' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to restore post' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDeletePost = async (postId: string) => {
    if (!confirm('Permanently purge this post and all associated comments from database? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await api.delete(`/posts/${postId}/permanent`);
      setMessage({ type: 'success', text: 'Post permanently purged from database' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete post' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Remove this comment?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/comments/${commentId}`);
      setMessage({ type: 'success', text: 'Comment moderated and deleted' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete comment' });
    } finally {
      setActionLoading(false);
    }
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
          onClick={fetchAdminData}
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
          <button onClick={() => setMessage(null)} className="font-bold p-1">
            &times;
          </button>
        </div>
      )}

      {/* KPI Stats Cards (Requirement 5: total users, total posts, total comments) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
            {stats?.overview.totalUsers ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-800">{stats?.overview.adminUsers ?? 0}</span> Admins ·{' '}
            <span className="font-semibold text-slate-800">{stats?.overview.regularUsers ?? 0}</span> Regular Users
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Posts</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mb-1">
            {stats?.overview.totalPosts ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold text-emerald-700">{stats?.overview.publishedPosts ?? 0}</span> Active ·{' '}
            <span className="font-semibold text-rose-700">{stats?.overview.deletedPosts ?? 0}</span> Soft-Deleted (Trash)
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Comments</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Post Views</span>
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

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Logs ({activityLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Post Management &amp; Trash ({trashPosts.length} archived)</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'comments'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comment Moderation ({comments.length})</span>
        </button>
      </div>

      {/* Tab 1: Audit Activity Logs */}
      {activeTab === 'metrics' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">System Audit Trail</h4>
              <p className="text-xs text-slate-500">Live operational logs captured by Express activity logger middleware</p>
            </div>
            <span className="font-mono text-xs text-slate-400">logActivity() middleware</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No activity logged yet.</div>
            ) : (
              activityLogs.map(log => (
                <div key={log._id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-800">{log.userEmail || 'System'}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                    <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    <div className="text-[10px]">{new Date(log.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: User Management Table */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">User Directory &amp; Permissions</h4>
            <p className="text-xs text-slate-500">Grant administrative access, suspend malicious accounts, or review author contributions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Stories</th>
                  <th className="px-6 py-3 text-right">Comments</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          u.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono tabular-nums">
                      {u.postsCount ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right font-mono tabular-nums">
                      {u.commentsCount ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleToggle(u._id, u.role)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                          title="Toggle Admin role"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleStatusToggle(u._id)}
                          disabled={actionLoading}
                          className={`p-1.5 rounded transition-colors ${
                            u.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'active' ? 'Suspend account' : 'Reactivate account'}
                        >
                          {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={actionLoading}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Post Management & Soft Delete Trash */}
      {activeTab === 'posts' && (
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
              trashPosts.map(p => (
                <div key={p._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      <span className="text-slate-400 font-mono text-[11px]">/{p.slug}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>Author: {p.author.name}</span>
                      <span>·</span>
                      <span>Category: {p.category}</span>
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
                      onClick={() => handleRestorePost(p._id)}
                      disabled={actionLoading}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                      title="Restore post back to public feed"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handleHardDeletePost(p._id)}
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
      )}

      {/* Tab 4: Comment Moderation */}
      {activeTab === 'comments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Universal Comment Moderation</h4>
            <p className="text-xs text-slate-500">Admins have permission to moderate and remove any comment across all publications</p>
          </div>

          <div className="divide-y divide-slate-100">
            {comments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">No comments available for moderation.</div>
            ) : (
              comments.map(c => (
                <div key={c._id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.author.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{c.author.email}</span>
                      <span className="text-slate-300">on</span>
                      <span className="text-indigo-600 font-medium truncate max-w-xs">{c.postTitle || 'Post'}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.content}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c._id)}
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
      )}
    </div>
  );
};
