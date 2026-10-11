import React from "react";
import { User } from "../../types";
import { UserCheck, UserX, Trash2 } from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { shallowEqual } from "react-redux";

interface AdminUsersTabProps {
  users: User[];
  actionLoading: boolean;
  onToggleRole: (userId: string, currentRole: "admin" | "user") => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  actionLoading,
  onToggleRole,
  onToggleStatus,
  onDeleteUser,
}) => {
  const { user } = useAppSelector((state) => state.auth, shallowEqual);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100">
        <h4 className="font-bold text-slate-900 text-sm">
          User Directory &amp; Permissions
        </h4>
        <p className="text-xs text-slate-500">
          Grant administrative access, suspend malicious accounts, or review
          author contributions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Member</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Stories</th>
              <th className="px-6 py-3 text-right">Comments</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          u.name,
                        )}`
                      }
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                      u.userRole === "admin"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {u.userRole.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold ${
                      u.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono tabular-nums">
                  {u.postsCount ?? 0}
                </td>
                <td className="px-6 py-4 text-right font-mono tabular-nums">
                  {u.commentsCount ?? 0}
                </td>
                {user?._id !== u._id && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleRole(u._id, u.userRole)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        title="Toggle Admin role"
                      >
                        {u.userRole === "admin" ? "Revoke Admin" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => onToggleStatus(u._id)}
                        disabled={actionLoading}
                        className={`p-1.5 rounded transition-colors ${
                          u.status === "active"
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          u.status === "active"
                            ? "Suspend account"
                            : "Reactivate account"
                        }
                      >
                        {u.status === "active" ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteUser(u._id, u.name)}
                        disabled={actionLoading}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
