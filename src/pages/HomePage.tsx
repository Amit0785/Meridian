import React, { useState, useEffect, useCallback } from 'react';
import { Post, Pagination } from '../types';
import { api } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { Search, ChevronLeft, ChevronRight, PenSquare, Sparkles, Filter } from 'lucide-react';

interface HomePageProps {
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
  onRestorePost: (post: Post) => void;
  onOpenNewPost: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPost,
  onEditPost,
  onDeletePost,
  onRestorePost,
  onOpenNewPost,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 6,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [categories, setCategories] = useState<string[]>(['All']);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Taxonomy (categories & tags)
  useEffect(() => {
    api.get('/posts/taxonomy')
      .then(res => {
        if (res.success && res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Posts
  const fetchPosts = useCallback(async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('page', pageToLoad.toString());
      params.append('limit', '6');

      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await api.get(`/posts?${params.toString()}`);
      if (res.success) {
        setPosts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const featuredPost = posts.find(p => p.featured) || posts[0];
  const regularPosts = featuredPost ? posts.filter(p => p._id !== featuredPost._id) : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header (Natural Editorial Title Case) */}
      <section className="border-b border-slate-200 pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">
            <span>MERN Stack Architecture</span>
            <span aria-hidden="true">·</span>
            <span>REST API v1</span>
            <span aria-hidden="true">·</span>
            <span>MongoDB ODM</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Engineering publications for systems architects.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            A production blog engine crafted with full MongoDB ODM semantics, JWT access &amp; refresh token lifecycles, and strict role-based access control.
          </p>
        </div>
      </section>

      {/* Interactive Controls & Filter Bar */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs (Functional buttons as allowed in Frontend Design) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search publications..."
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
          />
        </div>
      </section>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Posts Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white border border-slate-200 rounded-xl p-6 h-64 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-4/5"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
              </div>
              <div className="h-6 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">No publications found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {search
                ? `No articles matched query "${search}". Try clearing your search filters.`
                : 'No articles exist in this category yet. Be the first to publish one!'}
            </p>
          </div>
          <button
            onClick={onOpenNewPost}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write First Story</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Post Card (Hero) */}
          {featuredPost && pagination.page === 1 && !search && (
            <div className="mb-8">
              <PostCard
                post={featuredPost}
                onSelect={onSelectPost}
                onEdit={onEditPost}
                onDelete={onDeletePost}
                onRestore={onRestorePost}
                featured={true}
              />
            </div>
          )}

          {/* Grid of Remaining Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(pagination.page === 1 && !search ? regularPosts : posts).map(post => (
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total publications)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchPosts(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => fetchPosts(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
