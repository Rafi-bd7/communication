'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Pin, 
  MessageSquare, 
  Zap, 
  Users, 
  Phone, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { ConversationItem } from '@/components/chat/ChatList';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';

interface AddabariDashboardProps {
  conversations: ConversationItem[];
  onSelectConversation: (conv: ConversationItem) => void;
  onOpenQuickAdda: () => void;
  onOpenCollections: () => void;
}

export function AddabariDashboard({
  conversations,
  onSelectConversation,
  onOpenQuickAdda,
  onOpenCollections,
}: AddabariDashboardProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('all');

  const topics = [
    { id: 'all', label: t.all },
    { id: 'friends', label: t.topicFriends, icon: '☕' },
    { id: 'study', label: t.topicStudy, icon: '📚' },
    { id: 'work', label: t.topicWork, icon: '💼' },
    { id: 'project', label: t.topicProject, icon: '🚀' },
  ];

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const groupRooms = conversations.filter(c => c.type === 'group');
  const directChats = conversations.filter(c => c.type === 'direct');

  // Filter conversations by topic (mock/tag support)
  const filteredConvs = conversations.filter(conv => {
    if (selectedTopic === 'all') return true;
    const nameLower = (conv.name || '').toLowerCase();
    if (selectedTopic === 'study' && (nameLower.includes('study') || nameLower.includes('পড়া'))) return true;
    if (selectedTopic === 'work' && (nameLower.includes('work') || nameLower.includes('কাজ'))) return true;
    if (selectedTopic === 'project' && (nameLower.includes('project') || nameLower.includes('প্রজেক্ট'))) return true;
    if (selectedTopic === 'friends' && (nameLower.includes('friend') || nameLower.includes('বন্ধু') || conv.type === 'direct')) return true;
    return false;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0b141a] text-white p-6 md:p-10 select-none">
      {/* Top Welcome Banner */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#111b21] to-[#111b21] border border-brand-emerald/30 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-brand-emerald font-semibold text-xs tracking-wider uppercase mb-2">
                <Sparkles className="w-4 h-4" />
                <span>{t.addabariSubtitle}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {lang === 'bn' ? `স্বাগতম, ${user?.full_name || user?.username}! 👋` : `Welcome, ${user?.full_name || user?.username}! 👋`}
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                {t.brandTagline} — {lang === 'bn' ? 'আপনার প্রিয়জন এবং টিমমেটদের সাথে নিরবচ্ছিন্ন সংযোগে থাকুন।' : 'Stay seamlessly connected with your friends, groups, and teammates.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenQuickAdda}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-emerald to-emerald-500 text-brand-dark font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-emerald/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{t.quickAddaBtn}</span>
              </button>

              <button
                onClick={onOpenCollections}
                className="px-4 py-3 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] text-white text-sm font-medium flex items-center gap-2 border border-brand-border transition-colors"
              >
                <Bookmark className="w-4 h-4 text-brand-emerald" />
                <span>{t.collectionsTitle}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111b21] border border-brand-border/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-brand-emerald/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t.totalChats}</p>
              <h3 className="text-2xl font-bold text-white">{conversations.length}</h3>
            </div>
          </div>

          <div className="bg-[#111b21] border border-brand-border/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-brand-emerald/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t.unreadMessages}</p>
              <h3 className="text-2xl font-bold text-amber-400">{totalUnread}</h3>
            </div>
          </div>

          <div className="bg-[#111b21] border border-brand-border/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-brand-emerald/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t.activeRooms}</p>
              <h3 className="text-2xl font-bold text-white">{groupRooms.length}</h3>
            </div>
          </div>

          <div className="bg-[#111b21] border border-brand-border/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-brand-emerald/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-brand-emerald flex items-center justify-center">
              <Pin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t.pinnedRooms}</p>
              <h3 className="text-2xl font-bold text-white">{Math.min(conversations.length, 3)}</h3>
            </div>
          </div>
        </div>

        {/* Topic Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedTopic === topic.id
                  ? 'bg-brand-emerald text-brand-dark shadow-md shadow-brand-emerald/20 font-bold'
                  : 'bg-[#111b21] text-gray-300 hover:bg-[#202c33] border border-brand-border'
              }`}
            >
              {topic.icon && <span>{topic.icon}</span>}
              <span>{topic.label}</span>
            </button>
          ))}
        </div>

        {/* Main Sections: Pinned Rooms & Direct Chats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Pinned Adda Rooms */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-brand-emerald" />
                <span>{t.pinnedRooms}</span>
              </h3>
              <span className="text-xs text-gray-400">{filteredConvs.length} {lang === 'bn' ? 'টি আড্ডা পাওয়া গেছে' : 'chats found'}</span>
            </div>

            {filteredConvs.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#111b21] border border-brand-border flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm font-medium">{t.noPinnedRooms}</p>
                <button
                  onClick={onOpenQuickAdda}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand-emerald/20 text-brand-emerald text-xs font-bold hover:bg-brand-emerald/30 transition-colors"
                >
                  + {t.quickAddaBtn}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredConvs.slice(0, 6).map((conv) => {
                  const isGroup = conv.type === 'group';
                  const otherUser = conv.members?.find(m => m.user_id !== user?.id)?.user;
                  const title = isGroup ? (conv.name || 'Adda Room') : (otherUser?.full_name || otherUser?.username || 'Chat');
                  const avatar = conv.avatar_url || otherUser?.avatar_url;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => onSelectConversation(conv)}
                      className="group bg-[#111b21] hover:bg-[#182229] border border-brand-border/80 hover:border-brand-emerald/50 rounded-2xl p-5 cursor-pointer transition-all shadow-md flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={title}
                            avatarUrl={avatar}
                            size="lg"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-brand-emerald transition-colors line-clamp-1">
                              {title}
                            </h4>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              {isGroup ? (
                                <>
                                  <Users className="w-3 h-3 text-purple-400" />
                                  <span>{conv.members?.length || 0} {lang === 'bn' ? 'জন সদস্য' : 'members'}</span>
                                </>
                              ) : (
                                <>
                                  <span className={`w-2 h-2 rounded-full ${otherUser?.is_online ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                  <span>{otherUser?.is_online ? t.online : t.offline}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {conv.unread_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-brand-dark font-extrabold text-[10px]">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-brand-border/50">
                        <p className="line-clamp-1 text-gray-400 text-[11px]">
                          {conv.last_message?.content || (lang === 'bn' ? 'আড্ডা শুরু করতে ক্লিক করুন' : 'Tap to start chatting')}
                        </p>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-brand-emerald group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Quick Adda / Action Shortcuts */}
          <div className="flex flex-col gap-6">
            {/* Quick Adda Card */}
            <div className="bg-gradient-to-br from-[#111b21] to-[#182229] border border-brand-emerald/30 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald/20 text-brand-emerald flex items-center justify-center font-bold text-xl">
                ☕
              </div>
              <div>
                <h4 className="font-bold text-base text-white">{t.quickAddaTitle}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {t.quickAddaSubtitle}
                </p>
              </div>

              <button
                onClick={onOpenQuickAdda}
                className="w-full py-3 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{t.quickAddaBtn}</span>
              </button>
            </div>

            {/* Cultural Quotes / Microcopy */}
            <div className="bg-[#111b21] border border-brand-border rounded-3xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-emerald uppercase tracking-wider">
                <span>💡 {lang === 'bn' ? 'আড্ডার মূলমন্ত্র' : 'Adda Philosophy'}</span>
              </div>
              <blockquote className="text-xs italic text-gray-300 leading-relaxed">
                "{lang === 'bn' ? 'আড্ডা মানে শুধু কথা বলা নয়—এটি বন্ধন, আড্ডা হলো জীবনের সেরা মুহূর্তগুলো শেয়ার করার আনন্দ।' : 'Adda is more than conversation—it is the warmth of togetherness, sharing moments and ideas effortlessly.'}"
              </blockquote>
              <div className="text-[11px] text-gray-500 text-right">
                — Adda Blueprint
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
