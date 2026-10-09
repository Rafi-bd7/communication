'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Send, 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Globe, 
  Users,
  Camera, 
  Trash2,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import UserAvatar from '@/components/common/UserAvatar';

interface TimelineFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: (user: any) => void;
  onStartChat?: (userId: string) => void;
}

export function TimelineFeedDrawer({
  isOpen,
  onClose,
  onViewProfile,
  onStartChat,
}: TimelineFeedDrawerProps) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTimelineFeed();
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFeed();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const res = await api.uploadFile(file);
      setMediaUrl(res.file_url || res.url);
    } catch (err) {
      alert('Photo upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setIsPublishing(true);
    try {
      const newPost = await api.createPost({
        content: content.trim(),
        media_url: mediaUrl || undefined,
        privacy: privacy,
      });
      setPosts([newPost, ...posts]);
      setContent('');
      setMediaUrl(null);
    } catch (err: any) {
      alert(err.message || (lang === 'bn' ? 'পোস্ট প্রকাশ করা সম্ভব হয়নি' : 'Could not publish post'));
    } finally {
      setIsPublishing(false);
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border/80 flex items-center justify-between bg-[#152028]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'bn' ? 'আড্ডা টাইমলাইন ও সোশ্যাল ফিড' : 'Adda Community Feed'}
              </h3>
              <p className="text-xs text-gray-400">
                {lang === 'bn' ? 'সবার পোস্ট, ছবি ও মুহূর্তসমূহ' : 'Community updates & timeline stories'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFeed}
              title="রিফ্রেশ করুন"
              className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Post Composer (What's on your mind?) */}
          <div className="p-4 rounded-2xl bg-[#182229] border border-brand-border/90 shadow-md">
            <form onSubmit={handlePublishPost} className="space-y-3">
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={user?.full_name || user?.username}
                  avatarUrl={user?.avatar_url}
                  size="md"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={lang === 'bn' ? 'আপনার মনে কী চলছে? শেয়ার করুন...' : "What's on your mind? Share with community..."}
                  rows={2}
                  className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder-gray-400 focus:outline-none resize-none"
                />
              </div>

              {/* Uploaded media preview */}
              {mediaUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-56 bg-black/40 border border-brand-border">
                  <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-red-400 hover:bg-black"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="text-xs text-brand-emerald font-bold hover:bg-brand-emerald/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{isUploadingMedia ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'ছবি' : 'Photo')}</span>
                  </button>

                  {/* Privacy Selector */}
                  <div className="flex items-center gap-1 bg-[#202c33] rounded-xl px-2.5 py-1 text-xs border border-brand-border/70">
                    {privacy === 'public' ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Users className="w-3.5 h-3.5 text-emerald-400" />}
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value as 'public' | 'friends')}
                      className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="public" className="bg-[#111b21] text-white">
                        {lang === 'bn' ? '🌐 পাবলিক (Public)' : '🌐 Public'}
                      </option>
                      <option value="friends" className="bg-[#111b21] text-white">
                        {lang === 'bn' ? '👥 শুধু বন্ধুরা (Friends)' : '👥 Friends Only'}
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPublishing || (!content.trim() && !mediaUrl)}
                  className="px-5 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40"
                >
                  {isPublishing ? (lang === 'bn' ? 'পোস্ট হচ্ছে...' : 'Posting...') : (lang === 'bn' ? 'পোস্ট করুন' : 'Post')}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline Feed Stream */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
              <p className="text-xs">{t.loading}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
              <Sparkles className="w-10 h-10 text-gray-600" />
              <p className="font-semibold text-white">
                {lang === 'bn' ? 'এখনও কোনো পোস্ট প্রকাশিত হয়নি।' : 'No timeline posts published yet.'}
              </p>
              <p className="text-gray-400 max-w-xs">
                {lang === 'bn'
                  ? 'প্রথম পোস্টটি আপনিই লিখুন এবং বন্ধুদের সাথে আপনার অনুভূতি শেয়ার করুন!'
                  : 'Be the first to share an update with the community!'}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-3xl bg-[#152028] border border-brand-border/80 shadow-lg space-y-3.5"
              >
                {/* Author Info Bar */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => onViewProfile && onViewProfile(post.author)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <UserAvatar
                      name={post.author.full_name || post.author.username}
                      avatarUrl={post.author.avatar_url}
                      size="md"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-emerald transition-colors">
                        {post.author.full_name}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onStartChat && user?.id !== post.author.id && (
                      <button
                        onClick={() => {
                          onStartChat(post.author.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-brand-emerald hover:text-brand-dark text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                      </button>
                    )}

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
                <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {/* Attached Photo */}
                {post.media_url && (
                  <div className="rounded-2xl overflow-hidden max-h-80 border border-brand-border/50">
                    <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Like & Interaction Bar */}
                <div className="pt-2 border-t border-brand-border/50 flex items-center justify-between text-xs text-gray-400">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-semibold"
                  >
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                    <span>{post.likes_count} {lang === 'bn' ? 'পছন্দ' : 'Likes'}</span>
                  </button>

                  <span className={`text-[11px] flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${
                    post.privacy === 'friends'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {post.privacy === 'friends' ? (
                      <>
                        <Users className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'শুধু বন্ধুরা' : 'Friends'}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'পাবলিক' : 'Public'}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}
