'use client';

import { useState, useEffect } from 'react';
import { X, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { StatusItem } from './StatusTray';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';

interface StatusViewerModalProps {
  status: StatusItem | null;
  onClose: () => void;
  onStatusDeleted?: (statusId: string) => void;
}

export function StatusViewerModal({ status, onClose, onStatusDeleted }: StatusViewerModalProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!status) return;

    // Mark as viewed in backend
    api.viewStatus(status.id).catch(() => {});

    setProgress(0);
    const duration = 5000; // 5s per story
    const step = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + (step / duration) * 100;
      });
    }, step);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, onClose]);

  const canDelete = status && (status.user_id === user?.id || status.user?.id === user?.id || user?.is_admin);

  const handleDeleteStory = async () => {
    if (!status) return;
    if (!window.confirm('⚠️ আপনি কি নিশ্চিত যে আপনি এই স্টোরিটি মুছে ফেলতে চান?\nAre you sure you want to delete this story?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteStatus(status.id);
      if (onStatusDeleted) onStatusDeleted(status.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'স্টোরি ডিলিট করতে ব্যর্থ হয়েছে / Failed to delete story');
      setIsDeleting(false);
    }
  };

  if (!status) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm select-none">
      <div 
        className="relative w-full max-w-md h-full max-h-[850px] md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl"
        style={{ backgroundColor: status.background_color || '#059669' }}
      >
        {/* Top Progress Bar & Header */}
        <div className="p-4 z-20 bg-gradient-to-b from-black/60 to-transparent">
          {/* Progress Indicator */}
          <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-white h-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={status.user?.full_name || status.user?.username}
                avatarUrl={status.user?.avatar_url}
                size="md"
              />
              <div>
                <h4 className="font-semibold text-sm drop-shadow">{status.user?.full_name || 'User'}</h4>
                <p className="text-xs text-white/80 drop-shadow">24h Story Update</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteStory}
                  disabled={isDeleting}
                  title="Delete Story / স্টোরি ডিলিট করুন"
                  className="w-9 h-9 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-white text-center relative">
          {status.media_url ? (
            status.media_type === 'video' ? (
              <video 
                src={status.media_url} 
                autoPlay 
                playsInline 
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg"
              />
            ) : (
              <img
                src={status.media_url}
                alt="Story Media"
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg"
              />
            )
          ) : null}

          {status.caption && (
            <p className="mt-4 text-lg md:text-xl font-medium tracking-wide max-w-sm drop-shadow-md">
              {status.caption}
            </p>
          )}
        </div>

        {/* Bottom Views Counter */}
        <div className="p-4 z-20 flex items-center justify-center gap-2 text-white/80 bg-gradient-to-t from-black/60 to-transparent text-sm">
          <Eye className="w-4 h-4" />
          <span>{status.views_count} views</span>
        </div>
      </div>
    </div>
  );
}
