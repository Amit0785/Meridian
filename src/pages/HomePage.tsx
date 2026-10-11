import React, { useState, useEffect, useMemo } from "react";
import { Post } from "../types";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPosts, setPage } from "../store/slices/postsSlice";
import { debounce } from "../utils/debounce";
import { PostCard } from "../components/PostCard";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PenSquare,
  Filter,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  setSelectedPost,
  setEditingPost,
  softDeletePostThunk,
  restorePostThunk,
} from "../store/slices/postsSlice";
import { setNewPostOpen, setAuthOpen } from "../store/slices/uiSlice";
import { shallowEqual } from "react-redux";

const LIMIT = 6; // Number of posts per page

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { posts, pagination, loading, error } = useAppSelector(
    (state) => state.posts,
    shallowEqual,
  );

  const handleSelectPost = (post: Post) => {
    dispatch(setSelectedPost(post));
    navigate(`/posts/${encodeURIComponent(post.slug || post._id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditPost = (post: Post) => {
    dispatch(setEditingPost(post));
    dispatch(setNewPostOpen(true));
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to move "${post.title}" to trash?`))
      return;
    try {
      await dispatch(softDeletePostThunk(post._id)).unwrap();
    } catch (err: any) {
      alert(err.message || "Failed to soft delete post");
    }
  };

  const handleRestorePost = async (post: Post) => {
    try {
      await dispatch(restorePostThunk(post._id)).unwrap();
    } catch (err: any) {
      alert(err.message || "Failed to restore post");
    }
  };

  const handleOpenNewPost = () => {
    if (!isAuthenticated) {
      dispatch(setAuthOpen(true));
    } else {
      dispatch(setEditingPost(null));
      dispatch(setNewPostOpen(true));
    }
  };

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce function instance for search queries (400ms delay)
  const debouncedSearchFn = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedSearch(val.trim());
        setCurrentPage(1);
      }, 400),
    [],
  );

  // Cancel any pending debounce timer on component unmount
  useEffect(() => {
    return () => {
      debouncedSearchFn.cancel();
    };
  }, [debouncedSearchFn]);

  // Fetch posts immediately when search or currentPage changes
  useEffect(() => {
    dispatch(fetchPosts({ page: currentPage, limit: LIMIT, search: search }));
  }, [dispatch, currentPage, search]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    debouncedSearchFn(val);
  };

  const handleClearSearch = () => {
    debouncedSearchFn.cancel();
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(1);
    dispatch(setPage(1));
  };

  const handlePageChange = (newPage: number) => {
    if (
      !pagination ||
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.page
    ) {
      return;
    }
    setCurrentPage(newPage);
    dispatch(setPage(newPage));

    // Smooth scroll to top of publications list
    const anchor = document.getElementById("publications-top");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const isDebouncing = search.trim() !== debouncedSearch;

  // Generate smart pagination page numbers with ellipses
  const getPageNumbers = () => {
    if (!pagination || pagination.totalPages <= 1) return [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (current < total - 2) {
      pages.push("...");
    }

    if (!pages.includes(total)) {
      pages.push(total);
    }

    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <section className="border-b border-slate-200 pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">
            <span>MERN Stack Architecture</span>
            <span aria-hidden="true">·</span>
            <span>REST API v1</span>
            <span aria-hidden="true">·</span>
            <span>MongoDB &amp; Mongoose ODM</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5"
            style={{ textWrap: "balance" }}
          >
            Engineering publications for systems architects.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            A production blog engine crafted with full MongoDB ODM semantics,
            JWT access &amp; refresh token lifecycles, and strict role-based
            access control.
          </p>
        </div>
      </section>

      {/* Anchor for pagination scroll */}
      <div id="publications-top" className="scroll-mt-6" />

      {/* Interactive Controls & Filter Bar */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Latest Publications
          </h2>
          {pagination && pagination.totalCount > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.totalCount} total)
            </p>
          )}
        </div>

        {/* Search Bar (Anchored Right) */}
        <div className="relative min-w-[260px] md:w-72 md:ml-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search publications..."
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-14 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-xs"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
            {isDebouncing && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            )}
            {search && (
              <button
                onClick={handleClearSearch}
                title="Clear search"
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() =>
              dispatch(
                fetchPosts({
                  page: currentPage,
                  limit: LIMIT,
                  search: debouncedSearch,
                }),
              )
            }
            className="inline-flex items-center gap-1 font-semibold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Posts Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white border border-slate-200 rounded-xl p-6 h-64 animate-pulse flex flex-col justify-between"
            >
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
            <h4 className="text-base font-bold text-slate-900">
              No publications found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {debouncedSearch
                ? `No articles matched query "${debouncedSearch}". Try clearing your search.`
                : "No articles exist yet. Be the first to publish one!"}
            </p>
          </div>
          {search ? (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Clear Filter</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewPost}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write First Story</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                featured={false}
                onSelect={() => handleSelectPost(post)}
                onEdit={() => handleEditPost(post)}
                onDelete={() => handleDeletePost(post)}
                onRestore={() => handleRestorePost(post)}
              />
            ))}
          </div>

          {/* Interactive Pagination Bar */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 order-2 sm:order-1">
                Showing page{" "}
                <span className="font-semibold text-slate-900">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {pagination.totalPages}
                </span>{" "}
                <span className="text-slate-400">
                  ({pagination.totalCount}{" "}
                  {pagination.totalCount === 1 ? "publication" : "publications"}
                  )
                </span>
              </p>

              <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                {/* Jump to first page */}
                {pagination.page > 2 && pagination.totalPages > 4 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    title="First Page"
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Previous Page */}
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1 transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((pageItem, idx) =>
                    pageItem === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-xs text-slate-400 select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${pageItem}`}
                        onClick={() => handlePageChange(pageItem as number)}
                        className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                          pagination.page === pageItem
                            ? "bg-slate-900 text-white shadow-slate-900/10"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {pageItem}
                      </button>
                    ),
                  )}
                </div>

                {/* Next Page */}
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Jump to last page */}
                {pagination.page < pagination.totalPages - 1 &&
                  pagination.totalPages > 4 && (
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      title="Last Page"
                      className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
