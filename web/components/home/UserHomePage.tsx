'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Users, 
  Image as ImageIcon, 
  Send, 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Phone, 
  Video, 
  Smile, 
  Lock, 
  UserPlus, 
  Zap, 
  Sparkles,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import UserAvatar from '@/components/common/UserAvatar';
import { StatusItem } from '@/components/status/StatusTray';
import { PrivacyDropdown } from '@/components/common/PrivacyDropdown';

interface PostItem {
  id: string;
  content: string;
  media_url?: string;
  privacy?: string;
  likes_count: number;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
  };
}

interface UserHomePageProps {
  statuses: StatusItem[];
  onOpenCreateStory: () => void;
  onOpenStoryViewer: (st: StatusItem) => void;
  onStartChat: (userId: string) => void;
  onStartCall: (target: any, type: 'voice' | 'video') => void;
  onOpenDiscoverPeople: () => void;
  onOpenQuickAdda: () => void;
  onViewProfile?: (user: any) => void;
}

export function UserHomePage({
  statuses,
  onOpenCreateStory,
  onOpenStoryViewer,
  onStartChat,
  onStartCall,
  onOpenDiscoverPeople,
  onOpenQuickAdda,
  onViewProfile,
}: UserHomePageProps) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  // Feed Posts State
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  // Post Composer State
  const [postContent, setPostContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [isPublishing, setIsPublishing] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Comments Expanded Map
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const loadFeed = async () => {
    try {
      const data = await api.getTimelineFeed();
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadActiveUsers = async () => {
    try {
      const friends = await api.getMyFriends();
      setOnlineUsers(friends || []);
    } catch (err) {}
  };

  useEffect(() => {
    loadFeed();
    loadActiveUsers();
  }, []);

  const handleSelectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !mediaFile) return;

    setIsPublishing(true);
    try {
      let uploadedUrl: string | undefined = undefined;
      if (mediaFile) {
        const uploadRes = await api.uploadMedia(mediaFile);
        uploadedUrl = uploadRes.url || uploadRes.file_url;
      }

      const newPost = await api.createPost({
        content: postContent,
        media_url: uploadedUrl,
        privacy: privacy,
      });

      setPosts((prev) => [newPost, ...prev]);
      setPostContent('');
      setMediaFile(null);
      setMediaPreview(null);
    } catch (err: any) {
      alert(err.message || 'পোস্ট প্রকাশ ব্যর্থ হয়েছে');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (likedPosts[postId]) return;
    try {
      setLikedPosts((prev) => ({ ...prev, [postId]: true }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
      );
      await api.likePost(postId);
    } catch (err) {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(lang === 'bn' ? '⚠️ আপনি কি নিশ্চিত যে আপনি এই পোস্টটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      alert(err.message || (lang === 'bn' ? 'পোস্ট ডিলিট করা যায়নি' : 'Failed to delete post'));
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0b141a] text-white">
      <div className="max-w-6xl mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content Area (Stories + Composer + Posts) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* 1. Stories Tray (Facebook & WhatsApp Style) */}
          <div className="bg-[#111b21] border border-brand-border rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lang === 'bn' ? 'স্টোরিজ ও মুহূর্ত (24h Stories)' : 'Stories & Moments'}</span>
              </h3>
              <button
                onClick={onOpenCreateStory}
                className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'স্টোরি পোস্ট' : 'Add Story'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {/* My Add Story Card */}
              <div
                onClick={onOpenCreateStory}
                className="flex-shrink-0 w-24 h-36 rounded-2xl bg-gradient-to-b from-[#202c33] to-[#182229] border border-dashed border-brand-emerald/50 hover:border-brand-emerald flex flex-col items-center justify-center p-2 cursor-pointer group hover:scale-[1.02] transition-all relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-center text-gray-200">
                  {lang === 'bn' ? 'আপনার স্টোরি' : 'Your Story'}
                </span>
                <span className="text-[9px] text-brand-emerald mt-0.5 font-semibold">
                  {lang === 'bn' ? '+ যোগ করুন' : '+ Create'}
                </span>
              </div>

              {/* Status List */}
              {statuses.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onOpenStoryViewer(st)}
                  className="flex-shrink-0 w-24 h-36 rounded-2xl bg-[#202c33] border border-brand-border hover:border-brand-emerald flex flex-col items-center justify-between p-2.5 cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group shadow-md"
                >
                  <div className="w-full flex justify-center pt-1">
                    <UserAvatar
                      name={st.user.full_name}
                      avatarUrl={st.user.avatar_url}
                      size="md"
                      className="ring-2 ring-brand-emerald group-hover:ring-4 transition-all"
                    />
                  </div>
                  <div className="w-full text-center z-10">
                    <span className="text-[11px] font-bold text-white block truncate">
                      {st.user.full_name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-gray-400 block">
                      {new Date(st.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {st.media_url && (
                    <img
                      src={st.media_url}
                      alt="Story"
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Facebook Style Post Composer (What's on your mind?) */}
          <div className="bg-[#111b21] border border-brand-border rounded-3xl p-5 card-3d shadow-xl">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div
                  onClick={() => onViewProfile && user && onViewProfile(user)}
                  className="cursor-pointer hover:opacity-85 transition-opacity mt-1"
                  title={lang === 'bn' ? 'আমার প্রোফাইল দেখুন' : 'View My Profile'}
                >
                  <UserAvatar
                    name={user?.full_name || 'Me'}
                    avatarUrl={user?.avatar_url}
                    size="md"
                    className="avatar-3d"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={
                      lang === 'bn'
                        ? `মন কী চায়, ${user?.full_name?.split(' ')[0] || ''}? কিছু শেয়ার করুন...`
                        : `What's on your mind, ${user?.full_name?.split(' ')[0] || ''}?`
                    }
                    rows={3}
                    className="w-full bg-[#182229] border border-brand-border/60 rounded-2xl p-3.5 text-xs text-white placeholder-gray-400 input-3d transition-colors resize-none"
                  />

                  {/* Media Preview if attached */}
                  {mediaPreview && (
                    <div className="mt-2 relative rounded-2xl overflow-hidden border border-brand-border max-h-56 bg-black flex items-center justify-center card-3d">
                      <img src={mediaPreview} alt="Preview" className="max-h-56 object-contain" />
                      <button
                        type="button"
                        onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Composer Controls: Privacy + Attachment + Submit */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-border/50">
                <div className="flex items-center gap-2">
                  {/* Photo Attachment Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
                    onChange={handleSelectMedia}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-brand-emerald font-bold text-xs flex items-center gap-1.5 border border-brand-border/60 btn-3d-secondary transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'ছবি যুক্ত করুন' : 'Photo'}</span>
                  </button>

                  {/* Custom 3D Tactile Privacy Selector */}
                  <PrivacyDropdown
                    value={privacy as 'public' | 'friends'}
                    onChange={(val) => setPrivacy(val)}
                    lang={lang}
                    size="sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPublishing || (!postContent.trim() && !mediaFile)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-teal-400 text-brand-dark font-extrabold text-xs btn-3d disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishing ? (lang === 'bn' ? 'পোস্ট হচ্ছে...' : 'Posting...') : (lang === 'bn' ? 'পোস্ট করুন' : 'Post')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Social Newsfeed Posts */}
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-gray-300 flex items-center justify-between px-1">
              <span>{lang === 'bn' ? 'সর্বশেষ টাইমলাইন ও আপডেট' : 'Recent Newsfeed'}</span>
              <button onClick={loadFeed} className="text-xs text-brand-emerald font-semibold hover:underline">
                {lang === 'bn' ? 'রিফ্রেশ ↻' : 'Refresh ↻'}
              </button>
            </h3>

            {isLoadingPosts ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                <div className="w-6 h-6 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
                <span>{lang === 'bn' ? 'ফিড লোড হচ্ছে...' : 'Loading newsfeed...'}</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-[#111b21] border border-brand-border rounded-3xl p-10 text-center text-gray-400 text-xs">
                <Globe className="w-10 h-10 text-brand-emerald/50 mx-auto mb-2" />
                <p className="font-bold text-white text-sm mb-1">{lang === 'bn' ? 'এখনো কোনো পোস্ট নেই' : 'No posts yet'}</p>
                <p>{lang === 'bn' ? 'প্রথম পোস্ট লিখে বন্ধুদের সাথে আড্ডা শুরু করুন!' : 'Be the first to share an update with your friends!'}</p>
              </div>
            ) : (
              posts.map((post) => {
                const isFriendsOnly = post.privacy === 'friends';
                return (
                  <div
                    key={post.id}
                    className="bg-[#111b21] border border-brand-border rounded-3xl p-5 card-3d card-3d-hover flex flex-col gap-3.5 transition-all"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => onViewProfile && onViewProfile(post.author)}
                        className="flex items-center gap-3 cursor-pointer group"
                        title={lang === 'bn' ? `${post.author.full_name} এর প্রোফাইল দেখুন` : 'View Profile'}
                      >
                        <UserAvatar
                          name={post.author.full_name}
                          avatarUrl={post.author.avatar_url}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white group-hover:text-brand-emerald transition-colors">
                              {post.author.full_name}
                            </h4>
                            {/* Privacy Badge */}
                            {isFriendsOnly ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <Users className="w-3 h-3" />
                                <span>{lang === 'bn' ? 'শুধু বন্ধুরা' : 'Friends'}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <Globe className="w-3 h-3" />
                                <span>{lang === 'bn' ? 'পাবলিক' : 'Public'}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span>@{post.author.username}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Direct Chat with author shortcut */}
                        {post.author.id !== user?.id && (
                          <button
                            onClick={() => onStartChat(post.author.id)}
                            className="px-3 py-1.5 rounded-xl bg-brand-emerald/10 hover:bg-brand-emerald text-brand-emerald hover:text-brand-dark font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                          </button>
                        )}

                        {/* Delete post button */}
                        {(post.author.id === user?.id || user?.is_admin) && (
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            title={lang === 'bn' ? 'পোস্ট ডিলিট করুন' : 'Delete Post'}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs text-gray-100 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>

                    {/* Post Photo if attached */}
                    {post.media_url && (
                      <div className="rounded-2xl overflow-hidden border border-brand-border bg-black/40 max-h-96 flex items-center justify-center">
                        <img
                          src={post.media_url}
                          alt="Post media"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Post Action Buttons (Like / Comment / Share) */}
                    <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs text-gray-400">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl transition-all ${
                          likedPosts[post.id]
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'hover:text-rose-400 hover:bg-white/5'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-rose-400' : ''}`} />
                        <span>{post.likes_count}</span>
                        <span className="hidden sm:inline">{lang === 'bn' ? 'লাইক' : 'Like'}</span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                        }
                        className="flex items-center gap-1.5 font-bold hover:text-brand-emerald hover:bg-white/5 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'মন্তব্য' : 'Comment'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: post.author.full_name, text: post.content, url: window.location.href });
                          } else {
                            navigator.clipboard.writeText(post.content);
                            alert(lang === 'bn' ? 'পোস্টের টেক্সট কপি হয়েছে!' : 'Post copied to clipboard!');
                          }
                        }}
                        className="flex items-center gap-1.5 font-bold hover:text-blue-400 hover:bg-white/5 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
                      </button>
                    </div>

                    {/* Inline Comment Box */}
                    {expandedComments[post.id] && (
                      <div className="mt-2 pt-2 border-t border-brand-border/40 flex items-center gap-2 animate-fade-in">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder={lang === 'bn' ? 'একটি মন্তব্য লিখুন...' : 'Write a comment...'}
                          className="flex-1 bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!commentInputs[post.id]?.trim()) return;
                            alert(lang === 'bn' ? 'আপনার মন্তব্য প্রকাশিত হয়েছে!' : 'Comment posted!');
                            setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                          }}
                          className="px-3 py-2 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs"
                        >
                          {lang === 'bn' ? 'পাঠান' : 'Send'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar: Active Friends & Community Hub (Messenger & Facebook style) */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Quick Actions Card */}
          <div className="bg-[#111b21] border border-brand-border rounded-3xl p-5 card-3d flex flex-col gap-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-emerald" />
              <span>{lang === 'bn' ? 'ঝটপট ফিচার ও আড্ডা' : 'Quick Actions'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenQuickAdda}
                className="p-3.5 rounded-2xl bg-gradient-to-tr from-brand-emerald/20 to-teal-500/10 border border-brand-emerald/40 hover:border-brand-emerald flex flex-col items-start gap-1 btn-3d-secondary transition-all text-left"
              >
                <Zap className="w-5 h-5 text-brand-emerald" />
                <span className="font-bold text-xs text-white">{lang === 'bn' ? 'ঝটপট আড্ডা' : 'Quick Adda'}</span>
                <span className="text-[10px] text-gray-400">{lang === 'bn' ? 'লিংক শেয়ার' : 'Instant Room'}</span>
              </button>

              <button
                onClick={onOpenDiscoverPeople}
                className="p-3.5 rounded-2xl bg-[#182229] border border-brand-border hover:border-brand-emerald flex flex-col items-start gap-1 btn-3d-secondary transition-all text-left"
              >
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-xs text-white">{lang === 'bn' ? 'বন্ধু খুঁজুন' : 'Find Friends'}</span>
                <span className="text-[10px] text-gray-400">{lang === 'bn' ? 'রিকোয়েস্ট পাঠান' : 'Suggestions'}</span>
              </button>
            </div>
          </div>

          {/* Active Contacts / Friends (Messenger Style) */}
          <div className="bg-[#111b21] border border-brand-border rounded-3xl p-5 card-3d flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{lang === 'bn' ? 'আমার বন্ধুরা (Friends)' : 'Active Friends'}</span>
              </h3>
              <span className="text-[11px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-full">
                {onlineUsers.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
              {onlineUsers.length === 0 ? (
                <div className="py-6 text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-400">
                    {lang === 'bn' ? 'কোনো ফ্রেন্ড এখনও যুক্ত হয়নি।' : 'No friends connected yet.'}
                  </p>
                  <button
                    onClick={onOpenDiscoverPeople}
                    className="px-3 py-1.5 rounded-xl bg-brand-emerald text-brand-dark font-bold text-[11px] shadow hover:brightness-110 transition-all active:scale-95"
                  >
                    {lang === 'bn' ? 'নতুন বন্ধু খুঁজুন' : 'Find Friends'}
                  </button>
                </div>
              ) : (
                onlineUsers.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-2.5 rounded-2xl bg-[#182229]/60 hover:bg-[#202c33] border border-transparent hover:border-brand-border flex items-center justify-between transition-all"
                  >
                    <div 
                      onClick={() => onViewProfile && onViewProfile(contact)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                      title={lang === 'bn' ? `${contact.full_name} এর প্রোফাইল দেখুন` : 'View Profile'}
                    >
                      <div className="relative">
                        <UserAvatar
                          name={contact.full_name}
                          avatarUrl={contact.avatar_url}
                          size="sm"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#111b21] rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-white group-hover:text-brand-emerald transition-colors truncate">{contact.full_name}</h5>
                        <p className="text-[10px] text-gray-400 truncate">@{contact.username}</p>
                      </div>
                    </div>

                    {/* Quick Action Icons: Message / Call */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onStartChat(contact.id)}
                        className="p-1.5 rounded-xl hover:bg-brand-emerald/20 text-gray-400 hover:text-brand-emerald transition-colors"
                        title={lang === 'bn' ? 'মেসেজ পাঠান' : 'Chat'}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall(contact, 'voice')}
                        className="p-1.5 rounded-xl hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-colors"
                        title={lang === 'bn' ? 'ভয়েস কল' : 'Voice Call'}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall(contact, 'video')}
                        className="p-1.5 rounded-xl hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
                        title={lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Social Branding Card */}
          <div className="bg-gradient-to-tr from-[#111b21] via-[#182229] to-[#202c33] border border-brand-border rounded-3xl p-5 shadow-xl text-center text-xs text-gray-400">
            <img
              src="/logo.png"
              alt="Adda Logo"
              className="w-12 h-12 rounded-2xl object-cover mx-auto mb-2.5 shadow-lg shadow-brand-emerald/25 border border-brand-emerald/30"
            />
            <h4 className="font-bold text-white text-sm">Adda • {t.brandName}</h4>
            <p className="text-[11px] text-brand-emerald font-semibold mt-0.5">{t.brandTagline}</p>
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'হোয়াটসঅ্যাপ, মেসেঞ্জার এবং ফেসবুকের সেরা অভিজ্ঞতা একসাথে আপনার হাতের মুঠোয়।'
                : 'The unified blend of WhatsApp, Messenger, and Facebook in one single platform.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
