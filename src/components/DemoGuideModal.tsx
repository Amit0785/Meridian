import React from 'react';
import { X, Video, CheckCircle2, Shield, FileText, MessageSquare, Terminal, Sparkles } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  onOpenTestRunner: () => void;
  onSwitchDemo: (role: 'admin' | 'user') => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenTestRunner,
  onSwitchDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">5–10 Minute Demo Video Walkthrough Guide</h3>
              <p className="text-xs text-slate-500 font-mono">Step-by-step presentation script covering all evaluated requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl text-indigo-950">
            <h4 className="font-bold flex items-center gap-1.5 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Recommended Presentation Flow</span>
            </h4>
            <p className="text-xs text-indigo-900/80">
              Follow these 5 chapters during your screen recording to clearly demonstrate 100% compliance with every criterion in the rubric.
            </p>
          </div>

          {/* Chapter 1 */}
          <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">01. Application Overview &amp; Public Reading (1-2 mins)</span>
              <span className="font-mono text-slate-400 text-[11px]">Minutes 0:00 - 2:00</span>
            </div>
            <p className="text-slate-600">
              Introduce the <strong>Meridian MERN Blog Platform</strong>. Show the clean zero-pill typographic layout, category filtering (Architecture, Design &amp; UX, Security), live debounced search, and pagination. Click into an article to showcase the <strong>Markdown reader</strong>, reading time estimation, author profile card, and discussion tree.
            </p>
          </div>

          {/* Chapter 2 */}
          <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">02. User Authentication &amp; Token Lifecycles (2 mins)</span>
              <span className="font-mono text-slate-400 text-[11px]">Minutes 2:00 - 4:00</span>
            </div>
            <p className="text-slate-600">
              Open the <strong>Sign In</strong> modal. Highlight:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li><strong>Bcrypt Password Hashing</strong> &amp; Zod schema input validation.</li>
              <li><strong>JWT Access Tokens (15m)</strong> and <strong>Refresh Tokens (7d)</strong> with automatic sliding window refresh.</li>
              <li><strong>Sliding-window Rate Limiter</strong> protecting auth routes against brute-force attacks.</li>
              <li><strong>Social SSO Integration</strong> (Google &amp; Facebook OAuth 2.0).</li>
              <li>Show the 1-click Evaluator Switcher in the top bar to switch between <em>Admin</em> and <em>Regular User</em> roles.</li>
            </ul>
          </div>

          {/* Chapter 3 */}
          <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">03. Post Management, Slugs &amp; Soft Deletes (2 mins)</span>
              <span className="font-mono text-slate-400 text-[11px]">Minutes 4:00 - 6:00</span>
            </div>
            <p className="text-slate-600">
              As regular user Julian, click <strong>"Write Story"</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Demonstrate the <strong>Live URL Slug Generator</strong> reacting to your title in real time.</li>
              <li>Publish the article. Show that Julian can edit or trash his own post.</li>
              <li>Switch to Maya: show that Maya <strong>cannot edit Julian's post</strong> (enforced at API level via RBAC middleware).</li>
              <li>Click <strong>"Trash"</strong>: demonstrate <strong>Soft Deletes</strong> (the post is flagged <code>isDeleted: true</code> with <code>deletedAt</code> timestamp, excluded from public feed, and kept in the database).</li>
            </ul>
          </div>

          {/* Chapter 4 */}
          <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">04. Dedicated Admin Control Panel (2 mins)</span>
              <span className="font-mono text-slate-400 text-[11px]">Minutes 6:00 - 8:00</span>
            </div>
            <p className="text-slate-600">
              Switch to <strong>Admin (Eleanor Vance)</strong> and open the <strong>Admin Console</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Show <strong>Dashboard KPIs</strong>: Total Users, Active Posts, Trash Posts, Total Comments, and Views.</li>
              <li><strong>User Management</strong>: promote a regular user to Admin or toggle suspension.</li>
              <li><strong>Post Management &amp; Trash</strong>: inspect Julian's soft-deleted post and <strong>restore it with 1 click</strong> back to the live public feed.</li>
              <li><strong>Comment Moderation</strong>: delete inappropriate comments.</li>
              <li><strong>System Audit Logs</strong>: show live chronological entries recorded by the activity logger middleware.</li>
            </ul>
          </div>

          {/* Chapter 5 */}
          <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">05. Automated Testing &amp; Real-Time Events (1 min)</span>
              <span className="font-mono text-slate-400 text-[11px]">Minutes 8:00 - 9:30</span>
            </div>
            <p className="text-slate-600">
              Click <strong>"Test Suite"</strong> in the top bar to run the live Jest-style unit and integration tests (or run <code>npm test</code> in terminal). Showcase real-time toast alerts whenever comments or posts are published via Server-Sent Events.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSwitchDemo('admin');
                onClose();
              }}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
            >
              Switch to Demo Admin
            </button>
            <button
              onClick={() => {
                onOpenTestRunner();
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            >
              Open Test Suite
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
