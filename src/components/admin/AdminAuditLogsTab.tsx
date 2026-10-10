import React from 'react';
import { ActivityLog } from '../../types';

interface AdminAuditLogsTabProps {
  activityLogs: ActivityLog[];
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({ activityLogs }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">System Audit Trail</h4>
          <p className="text-xs text-slate-500">
            Live operational logs captured by Express activity logger middleware
          </p>
        </div>
        <span className="font-mono text-xs text-slate-400">logActivity() middleware</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {activityLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No activity logged yet.
          </div>
        ) : (
          activityLogs.map((log) => (
            <div
              key={log._id}
              className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {log.userEmail || 'System'}
                  </span>
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
  );
};
