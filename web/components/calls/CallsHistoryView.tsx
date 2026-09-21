'use client';

import { useState, useEffect } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';

interface CallsHistoryViewProps {
  onStartCall: (targetUser: any, type: 'voice' | 'video') => void;
}

export function CallsHistoryView({ onStartCall }: CallsHistoryViewProps) {
  const { user } = useAuth();
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCallHistory()
      .then((data) => setCalls(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const formatDuration = (sec: number) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="flex-1 h-full bg-brand-dark p-4 md:p-8 overflow-y-auto text-white select-none">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call Logs</h1>
          <p className="text-xs text-gray-400">History of voice and video calls</p>
        </div>

        {isLoading ? (
          <p className="text-xs text-gray-400">Loading call records...</p>
        ) : calls.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-brand-surface rounded-2xl border border-brand-border">
            <Phone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No calls recorded yet.</p>
          </div>
        ) : (
          <div className="bg-brand-surface border border-brand-border rounded-2xl divide-y divide-brand-border/40 overflow-hidden shadow-xl">
            {calls.map((c) => {
              const isOutgoing = c.caller_id === user?.id;
              const otherUser = isOutgoing ? c.receiver : c.caller;
              const isMissed = c.status === 'missed' || c.status === 'rejected';

              return (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-brand-card/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={otherUser?.full_name || otherUser?.username}
                      avatarUrl={otherUser?.avatar_url}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{otherUser?.full_name || 'Contact'}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-400" />
                        ) : isOutgoing ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>{new Date(c.started_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>{formatDuration(c.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {otherUser && (
                    <button
                      onClick={() => onStartCall(otherUser, c.call_type || 'video')}
                      className="p-2.5 rounded-xl bg-brand-card hover:bg-brand-emerald hover:text-brand-dark text-gray-300 transition-colors"
                      title="Call back"
                    >
                      {c.call_type === 'voice' ? <Phone className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
