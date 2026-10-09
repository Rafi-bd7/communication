'use client';

import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Edit3,
  Camera,
  Globe,
  Users,
  Save,
  User as UserIcon
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
  user: initialUser,
  isOpen,
  onClose,
  onStartChat,
  onStartCall,
}: UserProfileModalProps) {
  const { user: currentUser, updateUser } = useAuth();
  const { lang, t } = useLanguage();
  
  const [profileUser, setProfileUser] = useState<any>(initialUser);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  // Edit Mode State (for self profile)
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSelf = currentUser?.id === profileUser?.id;

  useEffect(() => {
    if (initialUser) {
      setProfileUser(initialUser);
      setEditFullName(initialUser.full_name || '');
      setEditBio(initialUser.bio || '');
      setEditPhone(initialUser.phone || '');
      setEditAvatarUrl(initialUser.avatar_url || '');
    }
  }, [initialUser]);

  useEffect(() => {
    if (isOpen && profileUser?.id) {
      setIsLoadingPosts(true);
      api.getUserPosts(profileUser.id)
        .then((data) => setPosts(data || []))
        .catch(() => setPosts([]))
        .finally(() => setIsLoadingPosts(false));
    }
  }, [isOpen, profileUser?.id]);

  if (!isOpen || !profileUser) return null;

  const handleSendFriendRequest = async () => {
    try {
      const res = await api.sendFriendRequest(profileUser.id);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await api.uploadFile(file);
      const newUrl = res.file_url || res.url;
      setEditAvatarUrl(newUrl);
    } catch (err) {
      alert(lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Photo upload failed');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        full_name: editFullName.trim(),
        bio: editBio.trim(),
        phone: editPhone.trim(),
        avatar_url: editAvatarUrl || undefined,
      });

      setProfileUser(updated);
      if (isSelf) {
        updateUser(updated);
      }
      setIsEditing(false);
      alert(lang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Cover Banner (Facebook Style) */}
        <div className="relative">
          <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 relative">
            <div className="absolute inset-0 bg-black/20" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar floating above cover */}
          <div className="px-6 -mt-14 sm:-mt-16 flex items-end justify-between">
            <div className="relative group">
              <UserAvatar
                name={profileUser.full_name || profileUser.username}
                avatarUrl={isEditing ? editAvatarUrl : profileUser.avatar_url}
                size="2xl"
                showOnline={true}
                isOnline={profileUser.is_online}
                className="ring-4 ring-[#111b21] shadow-2xl"
              />

              {/* Upload photo trigger in Edit mode */}
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-brand-emerald text-brand-dark shadow-lg hover:scale-105 transition-all"
                    title={lang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change profile photo'}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 mb-2">
              {isSelf ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-white border border-brand-border font-bold text-xs shadow flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>{isEditing ? (lang === 'bn' ? 'বাতিল' : 'Cancel') : (lang === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile')}</span>
                </button>
              ) : (
                <>
                  {onStartChat && (
                    <button
                      onClick={() => {
                        onStartChat(profileUser.id);
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
                        onClick={() => onStartCall(profileUser, 'voice')}
                        title="ভয়েস কল"
                        className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-brand-emerald border border-brand-border transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall(profileUser, 'video')}
                        title="ভিডিও কল"
                        className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-purple-400 border border-brand-border transition-colors"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form Modal Mode */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">
            <h3 className="font-extrabold text-sm text-brand-emerald flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রোফাইল তথ্য সম্পাদন করুন' : 'Edit Profile Details'}</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                {lang === 'bn' ? 'পুরো নাম (Full Name)' : 'Full Name'}
              </label>
              <input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
                className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                {lang === 'bn' ? 'নিজের সম্পর্কে (Bio / About)' : 'Bio / About'}
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                placeholder={lang === 'bn' ? 'আপনার শখ, কাজ বা অনুভূতি শেয়ার করুন...' : 'Share what you do or a short bio...'}
                className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর (Phone Number)' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+8801700000000"
                className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#202c33] text-gray-300 text-xs font-semibold hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes')}</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* User Identity Details */}
            <div className="px-6 pt-3 pb-4 border-b border-brand-border/60">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                {profileUser.full_name}
                {profileUser.is_admin && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-brand-emerald font-medium">@{profileUser.username}</p>

              <p className="mt-2 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {profileUser.bio || (lang === 'bn' ? 'আড্ডায় নিয়মিত যুক্ত থাকি।' : 'Hey there! I am using Adda.')}
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
                      {new Date(profileUser.created_at || Date.now()).toLocaleDateString('bn-BD', { month: 'short', year: 'numeric' })}
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={profileUser.full_name || profileUser.username}
                              avatarUrl={profileUser.avatar_url}
                              size="sm"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white">{profileUser.full_name}</h4>
                              <span className="text-[10px] text-gray-400">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
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

                        <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>

                        {post.media_url && (
                          <div className="rounded-xl overflow-hidden max-h-60 border border-brand-border/50">
                            <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-xs text-gray-400">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-semibold"
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
                    <UserIcon className="w-4 h-4 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'পুরো নাম' : 'Full Name'}</span>
                      <span className="font-semibold text-white">{profileUser.full_name}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</span>
                      <span className="font-semibold text-white">{profileUser.email || (lang === 'bn' ? 'গোপনীয় রাখা হয়েছে' : 'Hidden')}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</span>
                      <span className="font-semibold text-white">{profileUser.phone || (lang === 'bn' ? 'যুক্ত করা হয়নি' : 'Not added')}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'নিজের সম্পর্কে (Bio)' : 'Bio / About'}</span>
                      <span className="font-semibold text-white whitespace-pre-wrap">{profileUser.bio || (lang === 'bn' ? 'কোনো বায়ো নেই' : 'No bio added yet')}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1a232a] border border-brand-border flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'অ্যাকাউন্ট ভেরিফিকেশন' : 'Account Status'}</span>
                      <span className="font-semibold text-emerald-400">Active & Verified Account</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
