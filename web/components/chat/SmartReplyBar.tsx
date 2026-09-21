'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface SmartReplyBarProps {
  conversationId: string;
  lastMessage?: string;
  onSelectReply: (replyText: string) => void;
}

export function SmartReplyBar({ conversationId, lastMessage, onSelectReply }: SmartReplyBarProps) {
  const [replies, setReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    setIsLoading(true);
    api.getSmartReplies(conversationId, lastMessage)
      .then((res) => {
        if (res.options && res.options.length > 0) {
          setReplies(res.options);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [conversationId, lastMessage]);

  if (replies.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar bg-brand-surface/70 border-t border-brand-border/40 backdrop-blur-sm select-none">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 pl-1 flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AI Replies:</span>
      </div>
      <div className="flex items-center gap-2">
        {replies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectReply(reply)}
            className="text-xs px-3 py-1.5 rounded-full bg-brand-card hover:bg-purple-950/40 text-gray-200 hover:text-purple-300 border border-brand-border hover:border-purple-500/50 transition-all flex-shrink-0 shadow-sm active:scale-95"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
