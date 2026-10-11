import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { X, CheckCheck, Bell, MessageSquare, PenSquare, ShieldAlert, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePost?: (slug: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigatePost,
}) => {
  const navigate = useNavigate();
  const { notifications, setNotificationsList, markAllAsRead, clearNotification } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'post':
        return <PenSquare className="w-4 h-4 text-emerald-500" />;
      case 'admin':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">Live Notifications</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllAsRead}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No notifications yet. Live updates will appear here via Server-Sent Events.
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.targetUrl) {
                    const slug = item.targetUrl.replace('/post/', '');
                    if (onNavigatePost) {
                      onNavigatePost(slug);
                    } else {
                      navigate(`/posts/${encodeURIComponent(slug)}`);
                    }
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border transition-all text-xs cursor-pointer ${item.read
                    ? 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                    : 'border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/70 text-slate-900 font-medium'
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {getIcon(item.type)}
                    <span className="font-bold text-slate-900">{item.title}</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      clearNotification(item.id);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-slate-600 pl-6 leading-relaxed text-[11px]">{item.message}</p>
                <div className="pl-6 mt-1 text-[10px] text-slate-400 font-mono">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 font-mono">
          EventSource stream active (/notifications/stream)
        </div>
      </div>
    </div>
  );
};
