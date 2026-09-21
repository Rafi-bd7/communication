'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Phone, 
  HardDrive, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  RefreshCw 
} from 'lucide-react';
import { api } from '@/lib/api';
import UserAvatar from '@/components/common/UserAvatar';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, u, r] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAdminReports()
      ]);
      setMetrics(m);
      setUsers(u);
      setReports(r);
    } catch (err) {
      console.error('Admin data load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBan = async (userId: string) => {
    try {
      await api.toggleBanUser(userId);
      loadData();
    } catch (err) {
      alert('Failed to update ban status');
    }
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      await api.resolveReport(reportId, action);
      loadData();
    } catch (err) {
      alert('Failed to update report');
    }
  };

  return (
    <div className="flex-1 h-full bg-brand-dark overflow-y-auto p-4 md:p-8 text-white select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin & Moderation Center</h1>
            <p className="text-xs text-gray-400">Platform overview, user accounts, and moderation reports</p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-card hover:bg-brand-card/80 text-xs font-semibold text-gray-200 border border-brand-border transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-blue-400" /> Users
              </span>
              <span className="text-xl font-bold">{metrics.total_users}</span>
            </div>

            <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Chats
              </span>
              <span className="text-xl font-bold">{metrics.total_conversations}</span>
            </div>

            <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Messages
              </span>
              <span className="text-xl font-bold">{metrics.total_messages}</span>
            </div>

            <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Calls
              </span>
              <span className="text-xl font-bold">{metrics.total_calls}</span>
            </div>

            <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Storage
              </span>
              <span className="text-xl font-bold">{metrics.storage_mb} MB</span>
            </div>

            <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Reports
              </span>
              <span className="text-xl font-bold text-red-400">{metrics.pending_reports}</span>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-brand-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-6 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'reports'
                ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Moderation Reports ({reports.length})
          </button>
        </div>

        {/* Tab 1: Users Table */}
        {activeTab === 'users' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-card text-gray-400 font-semibold uppercase tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-brand-card/30 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <UserAvatar
                          name={u.full_name || u.username}
                          avatarUrl={u.avatar_url}
                          size="sm"
                        />
                        <span className="font-semibold text-white">{u.full_name}</span>
                      </td>
                      <td className="p-3.5 text-gray-300">@{u.username}</td>
                      <td className="p-3.5 text-gray-400">{u.email}</td>
                      <td className="p-3.5">
                        {u.is_admin ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-[10px]">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-[10px]">
                            Member
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {u.is_blocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold text-[10px]">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {!u.is_admin && (
                          <button
                            onClick={() => handleToggleBan(u.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              u.is_blocked
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            }`}
                          >
                            {u.is_blocked ? 'Unban' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No user reports pending! Everything is clean.
              </div>
            ) : (
              <div className="divide-y divide-brand-border/40">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          Reported User: {rep.reported_user?.full_name || 'User'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rep.status === 'pending' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 italic">"{rep.reason}"</p>
                      <span className="text-[10px] text-gray-500">
                        Filed by {rep.reporter?.full_name || 'Anonymous'}
                      </span>
                    </div>

                    {rep.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismiss')}
                          className="px-3 py-1.5 rounded-xl bg-brand-card hover:bg-brand-card/80 text-xs font-semibold text-gray-300"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'resolve')}
                          className="px-3 py-1.5 rounded-xl bg-brand-emerald text-brand-dark text-xs font-semibold"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
