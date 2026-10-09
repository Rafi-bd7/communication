'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Users, MessageSquarePlus, Circle, Zap, Smartphone, Copy, Check, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import UserAvatar from '@/components/common/UserAvatar';

export interface ConversationItem {
  id: string;
  type: string;
  name?: string;
  description?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    user: {
      id: string;
      username: string;
      full_name: string;
      avatar_url?: string;
      is_online: boolean;
    };
  }>;
  unread_count: number;
  last_message?: {
    id: string;
    content: string;
    message_type: string;
    created_at: string;
    sender_id: string;
  };
}

interface ChatListProps {
  conversations: ConversationItem[];
  selectedConversationId?: string;
  onSelectConversation: (conv: ConversationItem) => void;
  onNewChatCreated: (conv: ConversationItem) => void;
  onOpenQuickAdda?: () => void;
  onOpenDiscoverPeople?: () => void;
  onOpenProfile?: (user: any) => void;
}

export function ChatList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChatCreated,
  onOpenQuickAdda,
  onOpenDiscoverPeople,
  onOpenProfile,
}: ChatListProps) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [lanUrl, setLanUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreatingTestFriend, setIsCreatingTestFriend] = useState(false);

  useEffect(() => {
    api.getNetworkInfo()
      .then((info) => {
        setLanUrl(info.frontend_url || `http://${window.location.hostname}:3000`);
      })
      .catch(() => {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        setLanUrl(`http://${host === 'localhost' ? '192.168.0.103' : host}:3000`);
      });
  }, []);

  const handleCopyLink = () => {
    const url = lanUrl ? `${lanUrl}/register` : 'http://192.168.0.103:3000/register';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateTestFriend = async () => {
    setIsCreatingTestFriend(true);
    try {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `friend_${randomNum}`,
          email: `friend_${randomNum}@adda.chat`,
          full_name: `আড্ডা বন্ধু ${randomNum}`,
          password: 'password123'
        })
      });
      const data = await res.json();
      if (data.user) {
        const users = await api.listUsers();
        setAvailableUsers(users);
        await startDirectChat(data.user.id);
      }
    } catch (err) {
      alert('Could not create test friend');
    } finally {
      setIsCreatingTestFriend(false);
    }
  };

  const openNewChat = async () => {
    setShowNewChatModal(true);
    setIsLoadingUsers(true);
    try {
      const users = await api.listUsers();
      setAvailableUsers(users);
    } catch (e) {
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const openNewGroup = async () => {
    setShowNewGroupModal(true);
    setIsLoadingUsers(true);
    try {
      const users = await api.listUsers();
      setAvailableUsers(users);
    } catch (e) {
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const startDirectChat = async (targetUserId: string) => {
    try {
      const conv = await api.createDirectChat(targetUserId);
      onNewChatCreated(conv);
      onSelectConversation(conv);
      setShowNewChatModal(false);
    } catch (err) {
      alert('Could not start direct chat');
    }
  };

  const createGroupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    try {
      const conv = await api.createGroupChat({
        name: groupName.trim(),
        member_ids: selectedUserIds,
      });
      onNewChatCreated(conv);
      onSelectConversation(conv);
      setShowNewGroupModal(false);
      setGroupName('');
      setSelectedUserIds([]);
    } catch (err) {
      alert('Failed to create group');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(term);
    const msgMatch = c.last_message?.content?.toLowerCase().includes(term);
    return nameMatch || msgMatch;
  });

  const formatTimestamp = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-[#111b21] border-r border-brand-border flex flex-col select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#111b21]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-white">{t.navChats}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#202c33] text-gray-400 font-semibold">
            {conversations.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Discover People & Add Friends */}
          {onOpenDiscoverPeople && (
            <button
              type="button"
              onClick={onOpenDiscoverPeople}
              title={lang === 'bn' ? '👥 মানুষ খুঁজুন ও ফ্রেন্ড রিকোয়েস্ট পাঠান' : '👥 Discover People & Friends'}
              className="p-2 rounded-xl text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 transition-all active:scale-95 flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}

          {/* New 1-to-1 Chat */}
          <button
            type="button"
            onClick={openNewChat}
            title={lang === 'bn' ? 'নতুন ১-অন-১ মেসেজ' : 'New 1-on-1 Chat'}
            className="p-2 rounded-xl text-brand-emerald bg-brand-emerald/10 hover:bg-brand-emerald/20 transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-brand-border/60 bg-[#111b21]">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#202c33] text-white text-xs placeholder-gray-400 rounded-xl pl-9 pr-3 py-2 border border-brand-border focus:outline-none focus:border-brand-emerald transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-brand-border/20">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 gap-3">
            <p className="text-xs">{lang === 'bn' ? 'কোনো মেসেজ নেই।' : 'No conversations found.'}</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {onOpenDiscoverPeople && (
                <button
                  type="button"
                  onClick={onOpenDiscoverPeople}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? '👥 মানুষ খুঁজুন ও ফ্রেন্ড রিকোয়েস্ট পাঠান' : '👥 Discover People & Friends'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={openNewChat}
                className="w-full py-2 px-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs text-brand-emerald font-semibold border border-brand-border transition-colors"
              >
                {lang === 'bn' ? '১-অন-১ আড্ডা শুরু করুন' : 'Start a new conversation'}
              </button>
            </div>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedConversationId === conv.id;
            const otherMember = conv.members?.find((m) => m.user_id !== user?.id)?.user;
            const isOnline = otherMember?.is_online;
            const title = conv.type === 'group' ? (conv.name || 'Adda Room') : (otherMember?.full_name || otherMember?.username || 'Chat');

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#202c33]' : 'hover:bg-[#182229]'
                }`}
              >
                {/* Avatar with live online dot - click opens profile */}
                <div
                  onClick={(e) => {
                    if (otherMember && onOpenProfile) {
                      e.stopPropagation();
                      onOpenProfile(otherMember);
                    }
                  }}
                  title={otherMember ? (lang === 'bn' ? `${otherMember.full_name} এর প্রোফাইল দেখুন` : `View Profile`) : undefined}
                >
                  <UserAvatar
                    name={title}
                    avatarUrl={conv.avatar_url || otherMember?.avatar_url}
                    size="lg"
                    showOnline={conv.type === 'direct'}
                    isOnline={Boolean(isOnline)}
                  />
                </div>

                {/* Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {title}
                    </h4>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatTimestamp(conv.last_message?.created_at || conv.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate">
                      {conv.last_message ? (
                        conv.last_message.message_type === 'image' ? (lang === 'bn' ? '📷 ছবি' : '📷 Photo') :
                        conv.last_message.message_type === 'audio' ? (lang === 'bn' ? '🎤 ভয়েস বার্তা' : '🎤 Voice message') :
                        conv.last_message.message_type === 'file' ? (lang === 'bn' ? '📎 ফাইল' : '📎 Attachment') :
                        conv.last_message.content
                      ) : (
                        <span className="italic text-gray-500">{lang === 'bn' ? 'নতুন বার্তা পাঠান' : 'No messages yet'}</span>
                      )}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-brand-emerald text-brand-dark font-bold text-[10px]">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New 1-to-1 Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-brand-border rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3 text-white">
            <h3 className="font-bold text-sm text-white">{lang === 'bn' ? 'নতুন আড্ডা শুরু করুন' : 'Start a New Chat'}</h3>
            <div className="max-h-60 overflow-y-auto divide-y divide-brand-border/40">
              {isLoadingUsers ? (
                <p className="text-xs text-gray-400 p-3 text-center">{t.loading}</p>
              ) : availableUsers.length > 0 ? (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startDirectChat(u.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
                  >
                    <UserAvatar
                      name={u.full_name || u.username}
                      avatarUrl={u.avatar_url}
                      size="sm"
                    />
                    <div>
                      <h5 className="text-xs font-semibold text-white">{u.full_name}</h5>
                      <span className="text-[10px] text-gray-400">@{u.username}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-[#182229] border border-brand-border/80 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center shadow-inner">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {lang === 'bn' ? 'এখনও কোনো অন্য ব্যবহারকারী নেই' : 'No other users registered yet'}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                      {lang === 'bn'
                        ? 'আড্ডা দিতে আপনার মোবাইল ফোন বা অন্য ডিভাইস থেকে আরেকটি অ্যাকাউন্ট খুলুন:'
                        : 'Open this link on your phone to register another account:'}
                    </p>
                  </div>

                  {/* Device Link Display Box */}
                  <div className="w-full p-2.5 rounded-xl bg-[#0b141a] border border-brand-border flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 truncate">
                      {lanUrl ? `${lanUrl}` : 'http://192.168.0.103:3000'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-bold text-[10px] flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all shadow"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'লিংক কপি' : 'Copy')}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-400">
                    {lang === 'bn' 
                      ? '👉 মোবাইল ব্রাউজারে উপরের লিংকটি লিখুন এবং অ্যাকাউন্ট খুলুন।'
                      : '👉 Type this link in your mobile browser to join.'}
                  </p>

                  <div className="w-full pt-2 border-t border-brand-border/60">
                    <button
                      type="button"
                      onClick={handleCreateTestFriend}
                      disabled={isCreatingTestFriend}
                      className="w-full py-2 px-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-brand-emerald/40 text-brand-emerald font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isCreatingTestFriend
                          ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...')
                          : (lang === 'bn' ? 'পিসিতে টেস্ট করার জন্য ডেমো বন্ধু যোগ করুন' : 'Add Test Contact to Chat Now')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowNewChatModal(false)}
              className="w-full py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-gray-300 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* New Group Chat Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={createGroupChat} className="bg-[#111b21] border border-brand-border rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3 text-white">
            <h3 className="font-bold text-sm text-white">{lang === 'bn' ? 'নতুন আড্ডা রুম তৈরি করুন' : 'Create Group Chat'}</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={lang === 'bn' ? 'রুমের নাম লিখুন...' : 'Group name'}
              required
              className="w-full bg-[#202c33] text-white text-xs rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
            />
            <span className="text-[11px] text-gray-400 font-semibold uppercase">{lang === 'bn' ? 'সদস্য নির্বাচন করুন:' : 'Select Members:'}</span>
            <div className="max-h-48 overflow-y-auto divide-y divide-brand-border/40">
              {availableUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                      } else {
                        setSelectedUserIds([...selectedUserIds, u.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-emerald/15' : 'hover:bg-[#202c33]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={u.full_name || u.username}
                        avatarUrl={u.avatar_url}
                        size="xs"
                      />
                      <span className="text-xs text-white">{u.full_name}</span>
                    </div>
                    <input type="checkbox" checked={isSelected} readOnly className="accent-brand-emerald" />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-gray-300"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={!groupName.trim() || selectedUserIds.length === 0}
                className="flex-1 py-2 rounded-xl bg-brand-emerald text-brand-dark text-xs font-bold disabled:opacity-50 hover:brightness-110"
              >
                {lang === 'bn' ? 'তৈরি করুন' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
