import React from 'react';
import { Database, Server, Layers, ShieldCheck, Terminal, BookOpen, Video } from 'lucide-react';

interface FooterProps {
  onOpenApiDocs: () => void;
  onOpenTestRunner: () => void;
  onOpenDemoGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApiDocs, onOpenTestRunner, onOpenDemoGuide }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand and Description */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                M
              </div>
              <span className="font-bold text-slate-900 text-base">Meridian</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Production-grade MERN architecture blog engine implementing JWT authentication, RBAC middleware, soft-delete lifecycles, and relational Mongoose data structures.
            </p>
          </div>

          {/* MERN Architecture Specs */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              Technology Stack
            </div>
            <ul className="space-y-2 text-slate-500">
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>MongoDB & Mongoose ODM</span>
              </li>
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>Express.js & Node.js REST API</span>
              </li>
              <li className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>React 19 & Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>JWT Tokens & Bcrypt Hashing</span>
              </li>
            </ul>
          </div>

          {/* Developer Tools */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              Verification & Docs
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenApiDocs}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>REST API Specifications (v1)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTestRunner}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-mono"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Unit & Integration Test Console</span>
                </button>
              </li>
              {onOpenDemoGuide && (
                <li>
                  <button
                    onClick={onOpenDemoGuide}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>5–10 Min Demo Video Guide</span>
                  </button>
                </li>
              )}
              <li className="text-slate-500">
                <span>Zod Payload Schema Validation</span>
              </li>
              <li className="text-slate-500">
                <span>Sliding Window Rate Limiting</span>
              </li>
            </ul>
          </div>

          {/* System Specs */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
              Access & RBAC Controls
            </div>
            <p className="text-slate-500 leading-relaxed">
              Two-tiered privilege model enforced via API middleware: Administrator (universal post and user moderation) and Regular Users (author-only CRUD).
            </p>
            <div className="font-mono text-[11px] text-slate-400">
              API Base: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/api/v1</code>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            &copy; 2026 Meridian Blog Engine. All rights reserved. Built with MERN Stack.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
              API STATUS: OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
