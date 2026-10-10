import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, 
  PenSquare, 
  Shield, 
  LogOut, 
  User as UserIcon, 
  Terminal, 
  BookOpen, 
  ChevronDown,
  Sparkles,
  Video
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'articles' | 'admin' | 'my-posts';
  setCurrentTab: (tab: 'articles' | 'admin' | 'my-posts') => void;
  onOpenNewPost: () => void;
  onOpenAuth: () => void;
  onOpenApiDocs: () => void;
  onOpenTestRunner: () => void;
  onOpenNotifications: () => void;
  onOpenDemoGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewPost,
  onOpenAuth,
  onOpenApiDocs,
  onOpenTestRunner,
  onOpenNotifications,
  onOpenDemoGuide,
}) => {
  const { user, isAdmin, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('articles')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-slate-800 transition-colors">
              M
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                Meridian
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mt-0.5">
                MERN Platform
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line Text Links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentTab('articles')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 pb-0.5 ${
              currentTab === 'articles' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Publications
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setCurrentTab('my-posts')}
              className={`whitespace-nowrap transition-colors hover:text-slate-900 pb-0.5 ${
                currentTab === 'my-posts' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              My Stories
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-slate-900 pb-0.5 ${
                currentTab === 'admin' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Admin Console</span>
            </button>
          )}

          <button
            onClick={onOpenApiDocs}
            className="flex items-center gap-1 whitespace-nowrap transition-colors hover:text-slate-900"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </button>

          <button
            onClick={onOpenDemoGuide}
            className="hidden xl:flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-slate-900"
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span>Demo Guide</span>
          </button>

          <button
            onClick={onOpenTestRunner}
            className="flex items-center gap-1.5 whitespace-nowrap transition-colors text-slate-700 hover:text-slate-900 font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Suite</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User State */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Demo Switcher Menu */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Role</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div
                className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowDemoMenu(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Account
                </div>
                <button
                  onClick={() => {
                    switchDemoAccount('admin');
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-800 flex items-center justify-between">
                    Eleanor Vance <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 rounded">Admin</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">admin@meridian.dev (Full RBAC)</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoAccount('user');
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col gap-0.5 border-t border-slate-100"
                >
                  <span className="font-semibold text-slate-800 flex items-center justify-between">
                    Julian Chen <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 rounded">User</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">julian@meridian.dev (Regular Author)</span>
                </button>
                <button
                  onClick={() => {
                    switchDemoAccount('writer');
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col gap-0.5 border-t border-slate-100"
                >
                  <span className="font-semibold text-slate-800 flex items-center justify-between">
                    Maya Patel <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 rounded">User</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">maya@meridian.dev (Regular Author)</span>
                </button>
              </div>
            )}
          </div>

          {/* Real-Time Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Real-time notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* New Post Button */}
          {isAuthenticated ? (
            <button
              onClick={onOpenNewPost}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Story</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile / Menu */}
          {isAuthenticated && user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-slate-100 text-slate-700'
                      }`}>
                        ROLE: {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTab('my-posts');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>My Publications</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-indigo-600 font-medium"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
