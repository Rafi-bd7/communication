'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Video, 
  UserPlus, 
  UserCheck,
  UserX,
  Lock,
  Unlock,
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
  User as UserIcon,
  ShieldAlert,
  MapPin,
  GraduationCap,
  Briefcase,
  Cake,
  Image as ImageIcon
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
  const [isLoading, setIsLoading] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'posts'>('about');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Mode State (for self profile)
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editLivesIn, setEditLivesIn] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editWorkplace, setEditWorkplace] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const isSelf = Boolean(currentUser?.id && profileUser?.id && currentUser.id === profileUser.id);
  const isFriends = friendshipStatus === 'friends';
  const hasFullAccess = isSelf || isFriends;

  const loadProfileData = async (targetId: string) => {
    setIsLoading(true);
    try {
      const [fullUser, statusRes, userPosts] = await Promise.all([
        api.getUserProfile(targetId).catch(() => null),
        api.getFriendshipStatus(targetId).catch(() => ({ status: 'none', friendship_id: null })),
        api.getUserPosts(targetId).catch(() => []),
      ]);

      if (fullUser) {
        setProfileUser(fullUser);
        if (currentUser?.id === targetId) {
          setEditFullName(fullUser.full_name || '');
          setEditBio(fullUser.bio || '');
          setEditPhone(fullUser.phone || '');
          setEditDateOfBirth(fullUser.date_of_birth || '');
          setEditLivesIn(fullUser.lives_in || '');
          setEditEducation(fullUser.education || '');
          setEditWorkplace(fullUser.workplace || '');
          setEditAvatarUrl(fullUser.avatar_url || '');
          setEditCoverUrl(fullUser.cover_url || '');
        }
      }
      if (statusRes) {
        setFriendshipStatus(statusRes.status || 'none');
        setFriendshipId(statusRes.friendship_id || null);
      }
      setPosts(userPosts || []);
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialUser?.id) {
      setProfileUser(initialUser);
      setEditFullName(initialUser.full_name || '');
      setEditBio(initialUser.bio || '');
      setEditPhone(initialUser.phone || '');
      setEditDateOfBirth(initialUser.date_of_birth || '');
      setEditLivesIn(initialUser.lives_in || '');
      setEditEducation(initialUser.education || '');
      setEditWorkplace(initialUser.workplace || '');
      setEditAvatarUrl(initialUser.avatar_url || '');
      setEditCoverUrl(initialUser.cover_url || '');
      loadProfileData(initialUser.id);
    } else {
      setIsEditing(false);
    }
  }, [isOpen, initialUser?.id]);

  if (!isOpen || !profileUser) return null;

  const handleSendFriendRequest = async () => {
    setActionLoading(true);
    try {
      const res = await api.sendFriendRequest(profileUser.id);
      setFriendshipStatus(res.status || 'pending_sent');
      if (res.id) setFriendshipId(res.id);
      await loadProfileData(profileUser.id);
    } catch (err) {
      alert(lang === 'bn' ? 'ফ্রেন্ড রিকোয়েস্ট পাঠানো যায়নি' : 'Could not send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    setActionLoading(true);
    setFriendshipStatus('none');
    setFriendshipId(null);
    try {
      await api.cancelFriendRequest(profileUser.id);
      await loadProfileData(profileUser.id);
    } catch (err) {
      console.error('Cancel friend request error:', err);
      await loadProfileData(profileUser.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendshipId) return;
    setActionLoading(true);
    try {
      await api.acceptFriendRequest(friendshipId);
      setFriendshipStatus('friends');
      await loadProfileData(profileUser.id);
    } catch (err) {
      alert(lang === 'bn' ? 'অনুরোধ গ্রহণ করা যায়নি' : 'Could not accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    const confirmMsg = lang === 'bn'
      ? `আপনি কি নিশ্চিত যে ${profileUser.full_name}-কে আনফ্রেন্ড করতে চান?`
      : `Are you sure you want to unfriend ${profileUser.full_name}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      await api.unfriendUser(profileUser.id);
      setFriendshipStatus('none');
      setFriendshipId(null);
      await loadProfileData(profileUser.id);
    } catch (err) {
      alert(lang === 'bn' ? 'আনফ্রেন্ড করা যায়নি' : 'Could not unfriend');
    } finally {
      setActionLoading(false);
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const res = await api.uploadFile(file);
      const newUrl = res.file_url || res.url;
      setEditCoverUrl(newUrl);
    } catch (err) {
      alert(lang === 'bn' ? 'কভার ছবি আপলোড ব্যর্থ হয়েছে' : 'Cover photo upload failed');
    } finally {
      setIsUploadingCover(false);
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
        date_of_birth: editDateOfBirth.trim() || undefined,
        lives_in: editLivesIn.trim() || undefined,
        education: editEducation.trim() || undefined,
        workplace: editWorkplace.trim() || undefined,
        avatar_url: editAvatarUrl || undefined,
        cover_url: editCoverUrl || undefined,
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Cover Banner (Facebook Style) */}
        <div className="relative">
          <div className="h-32 sm:h-40 w-full relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950">
            {(isEditing ? editCoverUrl : profileUser.cover_url) ? (
              <img
                src={isEditing ? editCoverUrl : profileUser.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950" />
            )}
            <div className="absolute inset-0 bg-black/30" />

            {/* Privacy indicator badge on cover banner */}
            <div className="absolute top-3 left-4">
              {isSelf ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shadow backdrop-blur-sm">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}</span>
                </span>
              ) : isFriends ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shadow backdrop-blur-sm">
                  <UserCheck className="w-3 h-3" />
                  <span>{lang === 'bn' ? '✓ পরস্পরের বন্ধু (সব উন্মুক্ত)' : '✓ Friends (Full Access)'}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/25 border border-amber-500/50 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 shadow backdrop-blur-sm">
                  <Lock className="w-3 h-3" />
                  <span>{lang === 'bn' ? '🔒 প্রাইভেট (বন্ধু হলে সব দৃশ্যমান)' : '🔒 Private (Friend required)'}</span>
                </span>
              )}
            </div>

            {/* Change cover photo button in Edit Mode */}
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute bottom-3 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-lg transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isUploadingCover ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'কভার ছবি পরিবর্তন' : 'Change Cover')}</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors z-10"
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
                    accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
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
            <div className="flex items-center gap-2 mb-2 flex-wrap justify-end">
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
                  {/* Dynamic Friendship State Buttons */}
                  {friendshipStatus === 'friends' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'বন্ধু' : 'Friends'}</span>
                      </span>
                      <button
                        onClick={handleUnfriend}
                        disabled={actionLoading}
                        title={lang === 'bn' ? 'বন্ধু তালিকা থেকে সরান' : 'Unfriend'}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : friendshipStatus === 'pending_sent' ? (
                    <button
                      onClick={handleCancelFriendRequest}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'অনুরোধ বাতিল' : 'Cancel Request'}</span>
                    </button>
                  ) : friendshipStatus === 'pending_received' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleAcceptFriendRequest}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl bg-brand-emerald text-brand-dark font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'অনুরোধ গ্রহণ' : 'Accept'}</span>
                      </button>
                      <button
                        onClick={handleCancelFriendRequest}
                        disabled={actionLoading}
                        className="p-1.5 rounded-xl bg-[#202c33] text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-brand-emerald text-brand-dark font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'বন্ধু করুন' : 'Add Friend'}</span>
                    </button>
                  )}

                  {/* Direct Chat Shortcut */}
                  {onStartChat && (
                    <button
                      onClick={() => {
                        onStartChat(profileUser.id);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-white border border-brand-border font-bold text-xs shadow flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                    </button>
                  )}

                  {/* Call Shortcuts (enabled for friends or direct) */}
                  {onStartCall && (
                    <>
                      <button
                        onClick={() => onStartCall(profileUser, 'voice')}
                        title={lang === 'bn' ? 'ভয়েস কল' : 'Voice Call'}
                        className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-brand-emerald border border-brand-border transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall(profileUser, 'video')}
                        title={lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}
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
              <span>{lang === 'bn' ? 'প্রোফাইল তথ্য পরিবর্তন করুন' : 'Edit Profile Details'}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-pink-400" />
                  <span>{lang === 'bn' ? 'জন্ম তারিখ (Date of Birth)' : 'Date of Birth'}</span>
                </label>
                <input
                  type="date"
                  value={editDateOfBirth}
                  onChange={(e) => setEditDateOfBirth(e.target.value)}
                  className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'কোথায় থাকেন (Lives in)' : 'Lives in'}</span>
                </label>
                <input
                  type="text"
                  value={editLivesIn}
                  onChange={(e) => setEditLivesIn(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: ঢাকা, বাংলাদেশ' : 'e.g. Dhaka, Bangladesh'}
                  className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'bn' ? 'কোথায় পড়েন (Education)' : 'Education / Studies at'}</span>
                </label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  placeholder={lang === 'bn' ? 'স্কুল/কলেজ/বিশ্ববিদ্যালয়...' : 'School, College or University...'}
                  className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'কোথায় চাকরি করেন (Workplace)' : 'Workplace / Job'}</span>
                </label>
                <input
                  type="text"
                  value={editWorkplace}
                  onChange={(e) => setEditWorkplace(e.target.value)}
                  placeholder={lang === 'bn' ? 'কোম্পানি বা পেশা...' : 'Company or Occupation...'}
                  className="w-full bg-[#182229] border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                />
              </div>
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
            <div className="px-6 pt-3 pb-3 border-b border-brand-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    {profileUser.full_name}
                    {profileUser.is_admin && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        Admin
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-brand-emerald font-medium">@{profileUser.username}</p>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    profileUser.is_online
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${profileUser.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                    <span>{profileUser.is_online ? (lang === 'bn' ? 'এখন সক্রিয়' : 'Active Now') : (lang === 'bn' ? 'অফলাইন' : 'Offline')}</span>
                  </span>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {profileUser.bio || (lang === 'bn' ? 'আড্ডায় নিয়মিত যুক্ত থাকি।' : 'Hey there! I am using Adda.')}
              </p>

              {/* Social Stats Strip */}
              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-brand-border/40 text-xs">
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
                onClick={() => setActiveTab('about')}
                className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'about'
                    ? 'border-brand-emerald text-brand-emerald font-bold'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পরিচিতি ও যাবতীয় তথ্য' : 'About & Details'}</span>
              </button>

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
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'about' ? (
                <div className="space-y-3.5 text-xs text-gray-300">
                  
                  {/* Privacy Alert when not friends and not self */}
                  {!hasFullAccess && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/10 border border-amber-500/30 text-xs shadow-md">
                      <div className="flex items-center gap-2 text-amber-300 font-extrabold mb-1">
                        <Lock className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'প্রাইভেসি সুরক্ষা সক্রিয়' : 'Privacy Protection Active'}</span>
                      </div>
                      <p className="text-gray-300 text-[11px] leading-relaxed mb-3">
                        {lang === 'bn'
                          ? 'এই ব্যবহারকারীর ইমেইল ঠিকানা, ফোন নম্বর এবং গোপনীয় পোস্টগুলো দেখতে হলে পরস্পরের বন্ধু হতে হবে।'
                          : 'Email, phone number, and friend-only posts are visible only to mutual friends.'}
                      </p>

                      {friendshipStatus === 'none' && (
                        <button
                          onClick={handleSendFriendRequest}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-brand-emerald text-brand-dark font-extrabold text-xs flex items-center gap-1.5 shadow hover:brightness-110 active:scale-95 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'সব কিছু দেখতে ফ্রেন্ড রিকোয়েস্ট পাঠান' : 'Send Friend Request to Unlock'}</span>
                        </button>
                      )}

                      {friendshipStatus === 'pending_sent' && (
                        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-amber-300 font-bold">
                          <span>⏳ {lang === 'bn' ? 'ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে। তিনি একসেপ্ট করলেই সব দেখা যাবে।' : 'Friend request sent. Waiting for acceptance.'}</span>
                          <button
                            onClick={handleCancelFriendRequest}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-bold"
                          >
                            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mutual Friends Banner */}
                  {isFriends && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300">
                      <Unlock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-bold text-xs">
                        {lang === 'bn'
                          ? 'আপনারা পরস্পরের বন্ধু। এই ব্যবহারকারীর সব তথ্য ও পোস্ট আপনার জন্য উন্মুক্ত।'
                          : 'You are mutual friends. All profile details and posts are unlocked.'}
                      </span>
                    </div>
                  )}

                  {/* Identity: Full Name */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'পুরো নাম' : 'Full Name'}</span>
                      <span className="font-bold text-white truncate block">{profileUser.full_name}</span>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'ইউজারনেম' : 'Username'}</span>
                      <span className="font-semibold text-white truncate block">@{profileUser.username}</span>
                    </div>
                  </div>

                  {/* Email Address - Protected by Friendship Status */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</span>
                      {hasFullAccess ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{profileUser.email || (lang === 'bn' ? 'গোপন' : 'Hidden')}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            {lang === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? '🔒 শুধু বন্ধুদের জন্য দৃশ্যমান' : '🔒 Visible only to friends'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone Number - Protected by Friendship Status */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</span>
                      {hasFullAccess ? (
                        <span className="font-bold text-white truncate block">
                          {profileUser.phone || (lang === 'bn' ? 'যুক্ত করা হয়নি' : 'Not added')}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? '🔒 শুধু বন্ধুদের জন্য দৃশ্যমান' : '🔒 Visible only to friends'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth - Protected by Friendship Status */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <Cake className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'জন্ম তারিখ (Date of Birth)' : 'Date of Birth'}</span>
                      {hasFullAccess ? (
                        <span className="font-bold text-white truncate block">
                          {profileUser.date_of_birth || (lang === 'bn' ? 'যুক্ত করা হয়নি' : 'Not added')}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? '🔒 শুধু বন্ধুদের জন্য দৃশ্যমান' : '🔒 Visible only to friends'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lives in / Current Location - Protected by Friendship Status */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'বর্তমান ঠিকানা (Lives in)' : 'Lives in'}</span>
                      {hasFullAccess ? (
                        <span className="font-bold text-white truncate block">
                          {profileUser.lives_in || (lang === 'bn' ? 'যুক্ত করা হয়নি' : 'Not added')}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? '🔒 শুধু বন্ধুদের জন্য দৃশ্যমান' : '🔒 Visible only to friends'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Education / Studies at - Protected by Friendship Status */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'পড়াশোনা (Studies at)' : 'Education / Studies at'}</span>
                      {hasFullAccess ? (
                        <span className="font-bold text-white truncate block">
                          {profileUser.education || (lang === 'bn' ? 'যুক্ত করা হয়নি' : 'Not added')}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? '🔒 শুধু বন্ধুদের জন্য দৃশ্যমান' : '🔒 Visible only to friends'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Workplace / Job - Protected by Friendship Status */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'কর্মস্থল / চাকরি (Works at)' : 'Workplace / Job'}</span>
                      {hasFullAccess ? (
                        <span className="font-bold text-white truncate block">
                          {profileUser.workplace || (lang === 'bn' ? 'যুক্ত করা হয়নি' : 'Not added')}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? '🔒 শুধু বন্ধুদের জন্য দৃশ্যমান' : '🔒 Visible only to friends'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-start gap-3">
                    <FileText className="w-4 h-4 text-brand-emerald flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block mb-0.5">{lang === 'bn' ? 'নিজের সম্পর্কে (Bio)' : 'Bio / About'}</span>
                      <span className="font-medium text-gray-200 whitespace-pre-wrap leading-relaxed block">
                        {profileUser.bio || (lang === 'bn' ? 'কোনো বায়ো যোগ করা হয়নি।' : 'No bio added yet.')}
                      </span>
                    </div>
                  </div>

                  {/* Account Verification & Security */}
                  <div className="p-3.5 rounded-2xl bg-[#1a232a] border border-brand-border/80 flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 block">{lang === 'bn' ? 'নিরাপত্তা ও স্ট্যাটাস' : 'Account Status'}</span>
                      <span className="font-bold text-emerald-400">
                        {lang === 'bn' ? 'যাচাইকৃত সক্রিয় অ্যাকাউন্ট (Active & Verified)' : 'Active & Verified Account'}
                      </span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Posts Tab */
                isLoading ? (
                  <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
                    <p className="text-xs">{t.loading}</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 text-gray-600" />
                    <p className="font-bold text-white">{lang === 'bn' ? 'এখনও কোনো পোস্ট প্রকাশ করা হয়নি।' : 'No timeline posts published yet.'}</p>
                    {!hasFullAccess && (
                      <p className="text-[11px] text-amber-300 flex items-center gap-1 mt-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'গোপনীয় পোস্টগুলো দেখতে ফ্রেন্ড রিকোয়েস্ট পাঠান।' : 'Friend-only posts are hidden until you become friends.'}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!hasFullAccess && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {lang === 'bn'
                            ? 'এখানে শুধু পাবলিক পোস্টগুলো প্রদর্শিত হচ্ছে। বাকি পোস্ট দেখতে বন্ধু হন।'
                            : 'Only public posts are visible. Connect as friends to see all posts.'}
                        </span>
                      </div>
                    )}

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
                                {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
