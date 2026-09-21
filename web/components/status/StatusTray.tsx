'use client';

import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';

export interface StatusItem {
  id: string;
  user_id: string;
  media_url?: string;
  media_type: string;
  caption?: string;
  background_color?: string;
  created_at: string;
  expires_at: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  views_count: number;
  has_viewed: boolean;
}

interface StatusTrayProps {
  statuses: StatusItem[];
  onOpenCreate: () => void;
  onOpenViewer: (status: StatusItem) => void;
}

export function StatusTray({ statuses, onOpenCreate, onOpenViewer }: StatusTrayProps) {
  const { user } = useAuth();

  // Group statuses by user or show unique latest
  const myStatus = statuses.find((s) => s.user_id === user?.id);
  const otherStatuses = statuses.filter((s) => s.user_id !== user?.id);

  return (
    <div className="w-full bg-brand-surface border-b border-brand-border px-4 py-3 select-none">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
        {/* Add / My Status */}
        <div 
          onClick={myStatus ? () => onOpenViewer(myStatus) : onOpenCreate}
          className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 group"
        >
          <div className="relative">
            <div className={`w-14 h-14 rounded-full p-0.5 ${
              myStatus 
                ? 'bg-gradient-to-tr from-brand-emerald to-emerald-300 ring-2 ring-brand-emerald/30' 
                : 'border-2 border-dashed border-gray-500 group-hover:border-brand-emerald'
            } transition-all`}>
              <UserAvatar
                name={user?.full_name || user?.username}
                avatarUrl={user?.avatar_url}
                size="lg"
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreate();
              }}
              title="Add new story"
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-brand-emerald text-brand-dark flex items-center justify-center font-bold text-xs border-2 border-brand-surface shadow group-hover:scale-110 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-[11px] font-medium text-gray-300 max-w-[64px] truncate">
            {myStatus ? 'My Story' : 'Add Story'}
          </span>
        </div>

        {/* Other Users' Stories */}
        {otherStatuses.map((st) => (
          <div
            key={st.id}
            onClick={() => onOpenViewer(st)}
            className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 group"
          >
            <div className={`w-14 h-14 rounded-full p-0.5 transition-all group-hover:scale-105 ${
              st.has_viewed
                ? 'border-2 border-gray-600'
                : 'bg-gradient-to-tr from-brand-emerald via-teal-400 to-emerald-300 shadow-md shadow-brand-emerald/10'
            }`}>
              <UserAvatar
                name={st.user?.full_name || st.user?.username}
                avatarUrl={st.user?.avatar_url}
                size="lg"
              />
            </div>
            <span className="text-[11px] font-medium text-gray-300 max-w-[64px] truncate">
              {st.user?.full_name?.split(' ')[0] || st.user?.username || 'User'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
