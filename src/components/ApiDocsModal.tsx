import React, { useState } from 'react';
import { X, BookOpen, Key, Layers, Shield, FileText, ExternalLink, Code2 } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'swagger' | 'auth' | 'posts' | 'comments' | 'admin'>('swagger');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Meridian REST API Documentation (v1)</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                  Swagger OpenAPI 3.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">Live Swagger UI mounted at /api-docs and /api/v1/docs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Swagger UI</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 gap-2 text-xs font-semibold pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('swagger')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'swagger'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Swagger Explorer</span>
          </button>
          <button
            onClick={() => setActiveSection('auth')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'auth'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Authentication &amp; JWT</span>
          </button>
          <button
            onClick={() => setActiveSection('posts')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'posts'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Post Management &amp; Slugs</span>
          </button>
          <button
            onClick={() => setActiveSection('comments')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'comments'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Comments &amp; Relations</span>
          </button>
          <button
            onClick={() => setActiveSection('admin')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'admin'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control &amp; RBAC</span>
          </button>
        </div>

        {/* API Endpoint Documentation Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {activeSection === 'swagger' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Interactive Swagger UI Frame</h4>
                  <p className="text-xs text-slate-500">
                    Live Swagger UI instance served directly by Express via <code>swagger-ui-express</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/api-docs-json"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-mono text-[11px] transition-colors"
                  >
                    Raw OpenAPI JSON
                  </a>
                  <a
                    href="/api-docs"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden h-[540px] bg-slate-50">
                <iframe
                  src="/api-docs"
                  title="Swagger UI"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}
          {activeSection === 'auth' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/v1/auth/register</span>
                  <span className="text-slate-400 text-[11px]">(Rate Limited)</span>
                </div>
                <p className="text-slate-600 mb-2">Registers a new account. Hashes password using bcrypt. Returns user &amp; token pair.</p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px]">
                  {`Body: { name: string, email: string, password: string, role?: 'admin'|'user' }`}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/v1/auth/login</span>
                  <span className="text-slate-400 text-[11px]">(Rate Limited)</span>
                </div>
                <p className="text-slate-600 mb-2">Authenticates credentials with bcrypt. Returns 15m Access Token &amp; 7d Refresh Token.</p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px]">
                  {`Body: { email: string, password: string }`}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/v1/auth/refresh</span>
                </div>
                <p className="text-slate-600 mb-2">Refreshes expired access tokens using the cryptographic refresh token.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/auth/me</span>
                  <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Bearer Auth</span>
                </div>
                <p className="text-slate-600">Retrieves the authenticated user profile.</p>
              </div>
            </div>
          )}

          {activeSection === 'posts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/posts</span>
                </div>
                <p className="text-slate-600 mb-1">Paginated blog posts with filtering (category, tag, search, authorId, page, limit).</p>
                <p className="text-slate-400 font-mono text-[11px]">Automatically excludes soft-deleted articles unless queried by admin.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/posts/:slugOrId</span>
                </div>
                <p className="text-slate-600">Retrieves single post by URL-friendly slug or MongoDB _id. Increments view counter.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/v1/posts</span>
                  <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Bearer Auth</span>
                </div>
                <p className="text-slate-600 mb-2">Creates article with automatic URL slug generation and Zod validation.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">DELETE</span>
                  <span className="font-bold text-slate-900">/api/v1/posts/:id</span>
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[10px]">RBAC Ownership</span>
                </div>
                <p className="text-slate-600">Soft-deletes post by setting <code>isDeleted: true</code> and <code>deletedAt: Date</code>.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">PATCH</span>
                  <span className="font-bold text-slate-900">/api/v1/posts/:id/restore</span>
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[10px]">RBAC Ownership</span>
                </div>
                <p className="text-slate-600">Restores a soft-deleted post from the trash back to the public feed.</p>
              </div>
            </div>
          )}

          {activeSection === 'comments' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/comments/post/:postId</span>
                </div>
                <p className="text-slate-600">Returns comments associated with a post with populated author reference.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/v1/comments/post/:postId</span>
                  <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Bearer Auth</span>
                </div>
                <p className="text-slate-600">Submits comment linked to post. Broadcasts real-time event.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">DELETE</span>
                  <span className="font-bold text-slate-900">/api/v1/comments/:commentId</span>
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Author or Admin</span>
                </div>
                <p className="text-slate-600">Enforces RBAC: Users can only delete own comments; Admins can delete any comment.</p>
              </div>
            </div>
          )}

          {activeSection === 'admin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/admin/stats</span>
                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Admin Only</span>
                </div>
                <p className="text-slate-600">Calculates user count, post count (active vs soft-deleted), comments count, and traffic views.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/admin/users</span>
                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Admin Only</span>
                </div>
                <p className="text-slate-600">Fetches all registered users with post counts, comments count, and status.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">PATCH</span>
                  <span className="font-bold text-slate-900">/api/v1/admin/users/:userId/role</span>
                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Admin Only</span>
                </div>
                <p className="text-slate-600">Promotes or demotes user role between 'admin' and 'user'.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/v1/admin/activity-logs</span>
                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono text-[10px]">Admin Only</span>
                </div>
                <p className="text-slate-600">Audits user logins, post creations, soft deletes, and role changes.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] font-mono flex items-center justify-between">
          <span>Consistent Response: {`{ success: boolean, statusCode: number, data: any, message?: string }`}</span>
          <span>OpenAPI 3.0 Compatible</span>
        </div>
      </div>
    </div>
  );
};
