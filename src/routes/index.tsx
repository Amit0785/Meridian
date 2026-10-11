import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Route path constants for clean reference across the application
export const ROUTES = {
  HOME: "/",
  MY_POSTS: "/my-posts",
  ADMIN: "/admin",
  POST_DETAIL: "/posts/:slug",
} as const;

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import("../pages/HomePage"));
const MyPostsPage = lazy(() => import("../pages/MyPostsPage"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const PostDetailPage = lazy(() => import("../pages/PostDetailPage"));

/**
 * Fallback spinner displayed during lazy route module resolution
 */
const RouteLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] py-24 text-center">
    <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-xs text-slate-500 font-mono tracking-wide uppercase">
      Loading view...
    </p>
  </div>
);

/**
 * Main application routes with lazy loading and suspense fallback
 */
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.MY_POSTS} element={<MyPostsPage />} />
        <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        <Route path={ROUTES.POST_DETAIL} element={<PostDetailPage />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
