import React, { useState, useEffect, useCallback } from 'react';
import { Post } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { PenSquare, AlertTriangle, FileText } from 'lucide-react';

interface MyPostsPageProps {
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
  onRestorePost: (post: Post) => void;
  onOpenNewPost: () => void;
}

export const MyPostsPage: React.FC<MyPostsPageProps> = ({
  onSelectPost,
  onEditPost,
  onDeletePost,
  onRestorePost,
  onOpenNewPost,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'trash'>('all');

  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/posts?authorId=${user._id}&includeDeleted=true&limit=50`);
      if (res.success && Array.isArray(res.data)) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  if (!user) return null;

  const filteredPosts = posts.filter(p => {
    if (filter === 'active') return !p.isDeleted;
    if (filter === 'trash') return p.isDeleted;
    return true;
  });

  const activeCount = posts.filter(p => !p.isDeleted).length;
  const trashCount = posts.filter(p => p.isDeleted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Publications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your published articles and soft-deleted drafts ({activeCount} active · {trashCount} archived)
          </p>
        </div>

        <button
          onClick={onOpenNewPost}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>Write Story</span>
        </button>
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({posts.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'active' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('trash')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'trash' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Trash ({trashCount})
        </button>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white border border-slate-200 rounded-xl p-6 h-56 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-5 bg-slate-200 rounded w-4/5 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">No stories found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {filter === 'trash'
                ? 'Your trash is completely empty.'
                : 'You have not written any publications yet.'}
            </p>
          </div>
          {filter !== 'trash' && (
            <button
              onClick={onOpenNewPost}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Your First Article</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onSelect={onSelectPost}
              onEdit={onEditPost}
              onDelete={onDeletePost}
              onRestore={onRestorePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};
