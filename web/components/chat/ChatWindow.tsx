'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft, 
  ShieldAlert, 
  Search
} from 'lucide-react';
import { ConversationItem } from './ChatList';
import { MessageBubble, MessageItem } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import UserAvatar from '@/components/common/UserAvatar';

interface ChatWindowProps {
  conversation: ConversationItem;
  messages: MessageItem[];
  typingUsers: string[];
  onBack: () => void;
  onSendMessage: (data: any) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onStartCall: (callType: 'voice' | 'video') => void;
  onTyping: (isTyping: boolean) => void;
  onOpenProfile?: (user: any) => void;
}

export function ChatWindow({
  conversation,
  messages,
  typingUsers,
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactMessage,
  onStartCall,
  onTyping,
  onOpenProfile,
}: ChatWindowProps) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [replyingTo, setReplyingTo] = useState<MessageItem | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageItem | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const otherMember = conversation.members?.find((m) => m.user_id !== user?.id)?.user;
  const isDirect = conversation.type === 'direct';
  const isGroup = conversation.type === 'group';

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await api.submitReport({
        reported_user_id: otherMember?.id,
        reason: reportReason.trim(),
      });
      alert(lang === 'bn' ? 'রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে।' : 'Report submitted for admin review.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  const title = isGroup ? (conversation.name || 'Room') : (otherMember?.full_name || otherMember?.username || 'Chat');

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 h-full bg-[#0b141a] flex flex-col overflow-hidden select-none">
      {/* Chat Header */}
      <div className="h-16 px-4 bg-[#111b21] border-b border-brand-border flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1.5 rounded-xl text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar with Status & Profile Trigger */}
          <div 
            onClick={() => {
              if (isDirect && otherMember && onOpenProfile) {
                onOpenProfile(otherMember);
              }
            }}
            className={`flex items-center gap-3 min-w-0 ${isDirect ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          >
            <UserAvatar
              name={title}
              avatarUrl={conversation.avatar_url || otherMember?.avatar_url}
              size="md"
              showOnline={Boolean(isDirect)}
              isOnline={Boolean(otherMember?.is_online)}
            />

            {/* Title & Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  {title}
                </h3>
                {isGroup && (
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] hidden sm:inline-block">
                    {lang === 'bn' ? 'গ্রুপ' : 'Group'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate">
                {typingUsers.length > 0 ? (
                  <span className="text-brand-emerald font-medium animate-pulse">
                    {t.typing}
                  </span>
                ) : isDirect ? (
                  otherMember?.is_online ? (
                    <span className="text-emerald-400 font-medium">{t.online}</span>
                  ) : (
                    t.offline
                  )
                ) : (
                  `${conversation.members?.length || 0} ${lang === 'bn' ? 'জন সদস্য' : 'members'}`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search messages */}
          <button
            type="button"
            onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
            title={lang === 'bn' ? 'বার্তা খুঁজুন' : 'Search messages'}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#202c33] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Voice Call */}
          {isDirect && (
            <button
              type="button"
              onClick={() => onStartCall('voice')}
              title={lang === 'bn' ? 'অডিও কল' : 'Voice Call'}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#202c33] transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}

          {/* Video Call */}
          {isDirect && (
            <button
              type="button"
              onClick={() => onStartCall('video')}
              title={lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}
              className="p-2 rounded-xl text-gray-300 hover:text-brand-emerald hover:bg-[#202c33] transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#202c33] transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 bg-[#182229] border border-brand-border p-1.5 rounded-2xl shadow-2xl w-48 z-30 flex flex-col gap-0.5 text-xs text-gray-200 animate-fade-in">
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-left"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'রিপোর্ট করুন' : 'Report'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-chat Message Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-[#111b21] border-b border-brand-border flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'বার্তায় খুঁজুন...' : 'Search in messages...'}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white text-xs">✕</button>
          )}
        </div>
      )}

      {/* Messages Timeline */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{
          backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <p className="text-sm">
              {searchQuery 
                ? (lang === 'bn' ? 'কোনো বার্তা পাওয়া যায়নি।' : 'No messages found.')
                : (lang === 'bn' ? 'এখনো কোনো বার্তা নেই। আড্ডা শুরু করতে একটি বার্তা পাঠান!' : 'No messages yet. Send a greeting to start chatting!')}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onReply={(m) => setReplyingTo(m)}
              onEdit={(m) => setEditingMessage(m)}
              onDelete={(id) => onDeleteMessage(id)}
              onReact={(id, emoji) => onReactMessage(id, emoji)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onTyping={onTyping}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReportSubmit} className="bg-[#111b21] border border-brand-border rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3 text-white">
            <h3 className="font-bold text-sm flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <span>{lang === 'bn' ? 'রিপোর্ট করুন' : 'Report'}</span>
            </h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder={lang === 'bn' ? 'রিপোর্টের কারণ লিখুন (স্প্যাম, হয়রানি ইত্যাদি)' : 'Why are you reporting? (Spam, Harassment, etc.)'}
              required
              rows={3}
              className="w-full bg-[#202c33] text-xs rounded-xl p-3 border border-brand-border focus:outline-none focus:border-red-400 text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#202c33] text-xs font-semibold text-gray-300"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {lang === 'bn' ? 'জমা দিন' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
