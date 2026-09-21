'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Video, 
  UserPlus, 
  Check, 
  Calendar, 
  Mail, 
  Phone as PhoneIcon, 
  ShieldCheck, 
  Heart, 
  Clock, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';

interface UserProfileModalProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (user: any, type: 'voice' | 'video') => void;
}

export function UserProfileModal({
  user,
  isOpen,
  onClose,
  onStartChat,
  onStartCall,
}: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  const { lang, t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const isSelf = currentUser?.id === user?.id;

  useEffect(() => {
    if (isOpen && user?.id) {
      setIsLoadingPosts(true);
      api.getUserPosts(user.id)
        .then((data) => setPosts(data || []))
        .catch(() => setPosts([]))
        .finally(() => setIsLoadingPosts(false));
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSendFriendRequest = async () => {
    try {
      const res = await api.sendFriendRequest(user.id);
      setFriendshipStatus(res.status);
    } catch (err) {
      alert('Could not send friend request');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await api.likePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes_count: res.likes_count } : p))
      );
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Profile Header & Cover Banner */}
        <div className="relative">
          {/* Facebook-style Cover Gradient */}
          <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 relative">
            <div className="absolute inset-0 bg-black/20" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar floating above cover */}
          <div className="px-6 -mt-14 sm:-mt-16 flex items-end justify-between">
            <div className="relative">
              <UserAvatar
                name={user.full_name || user.username}
                avatarUrl={user.avatar_url}
                size="2xl"
                showOnline={true}
                isOnline={user.is_online}
                className="ring-4 ring-[#111b21] shadow-2xl"
              />
            </div>

            {/* Quick Actions */}
            {!isSelf && (
              <div className="flex items-center gap-2 mb-2">
                {onStartChat && (
                  <button
                    onClick={() => {
                      onStartChat(user.id);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                  </button>
                )}

                {onStartCall && (
                  <>
                    <button
                      onClick={() => onStartCall(user, 'voice')}
                      title="ভয়েস কল"
                      className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-brand-emerald border border-brand-border transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStartCall(user, 'video')}
                      title="ভিডিও কল"
                      className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-purple-400 border border-brand-border transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Identity Details */}
        <div className="px-6 pt-3 pb-4 border-b border-brand-border/60">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            {user.full_name}
            {user.is_admin && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                Admin
              </span>
            )}
          </h2>
          <p className="text-xs text-brand-emerald font-medium">@{user.username}</p>

          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            {user.bio || (lang === 'bn' ? 'আড্ডায় নিয়মিত যুক্ত থাকি।' : 'Hey there! I am using Adda.')}
          </p>

          {/* Social Stats Strip */}
          <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-brand-border/40 text-xs">
            <div className="p-2.5 rounded-xl bg-[#202c33]/70 border border-brand-border flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-brand-emerald" />
              <div>
                <span className="font-bold text-white block">{posts.length}</span>
                <span className="text-[10px] text-gray-400">{lang === 'bn' ? 'পোস্ট' : 'Posts'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#202c33]/70 border border-brand-border flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-bold text-white block">
                  {new Date(user.created_at || Date.now()).toLocaleDateString('bn-BD', { month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[10px] text-gray-400">{lang === 'bn' ? 'যোগদান' : 'Joined'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-brand-border/60 flex gap-6 bg-[#0b141a]/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'border-brand-emerald text-brand-emerald font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'টাইমলাইন পোস্টসমূহ' : 'Timeline Posts'} ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'about'
                ? 'border-brand-emerald text-brand-emerald font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'পরিচিতি ও বিবরণ' : 'About Details'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'posts' ? (
            isLoadingPosts ? (
              <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
                <p className="text-xs">{t.loading}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-gray-600" />
                <p>{lang === 'bn' ? 'এখনও কোনো পোস্ট প্রকাশ করা হয়নি।' : 'No timeline posts published yet.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-[#1a232a] border border-brand-border/70 space-y-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user.full_name || user.username}
                        avatarUrl={user.avatar_url}
                        size="sm"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{user.full_name}</h4>
                        <span className="text-[10px] text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>

                    {post.media_url && (
                      <div className="rounded-xl overflow-hidden max-h-60">
                        <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-xs text-gray-400">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-red-400 fill-current" />
                        <span>{post.likes_count}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-emerald" />
                <div>
                  <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</span>
                  <span className="font-semibold text-white">{user.email || 'গোপনীয় রাখা হয়েছে'}</span>
                </div>
              </div>

              {user.phone && (
                <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4 text-brand-emerald" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}</span>
                    <span className="font-semibold text-white">{user.phone}</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                <div>
                  <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'অ্যাকাউন্ট ভেরিফিকেশন' : 'Account Status'}</span>
                  <span className="font-semibold text-emerald-400">Active & Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
