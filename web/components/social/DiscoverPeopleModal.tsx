'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  Search, 
  Smartphone,
  Copy,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import UserAvatar from '@/components/common/UserAvatar';

interface DiscoverPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (userId: string) => void;
  onViewProfile?: (user: any) => void;
}

export function DiscoverPeopleModal({
  isOpen,
  onClose,
  onStartChat,
  onViewProfile,
}: DiscoverPeopleModalProps) {
  const { lang, t } = useLanguage();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [myFriends, setMyFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'friends' | 'requests'>('suggestions');

  const loadData = async (query?: string) => {
    setIsLoading(true);
    try {
      const [suggs, reqs, friends] = await Promise.all([
        api.getFriendSuggestions(query).catch(() => []),
        api.getPendingRequests().catch(() => []),
        api.getMyFriends().catch(() => []),
      ]);
      setSuggestions(suggs || []);
      setPendingRequests(reqs || []);
      setMyFriends(friends || []);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendRequest = async (targetUserId: string) => {
    try {
      const res = await api.sendFriendRequest(targetUserId);
      setSuggestions((prev) =>
        prev.map((s) =>
          s.user.id === targetUserId
            ? { ...s, friendship_status: res.status, friendship_id: res.id }
            : s
        )
      );
      if (res.status === 'friends') {
        onStartChat(targetUserId);
        onClose();
      }
    } catch (err) {
      alert('Could not send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string, userId: string) => {
    try {
      await api.acceptFriendRequest(friendshipId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      await loadData();
      onStartChat(userId);
      onClose();
    } catch (err) {
      alert('Could not accept friend request');
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      await api.declineFriendRequest(friendshipId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      await loadData();
    } catch (err) {
      alert('Could not decline request');
    }
  };

  const handleCancelRequest = async (targetUserId: string) => {
    // Immediate optimistic update so button switches to Add Friend instantly
    setSuggestions((prev) =>
      prev.map((s) =>
        s.user.id === targetUserId || s.friendship_id === targetUserId
          ? { ...s, friendship_status: 'none', friendship_id: null }
          : s
      )
    );
    try {
      await api.cancelFriendRequest(targetUserId);
    } catch (err) {
      console.error('Cancel request error:', err);
      // Quietly reload data to keep state in sync
      await loadData();
    }
  };

  const handleCopyInviteLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/register`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredSuggestions = suggestions.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.user?.full_name?.toLowerCase().includes(q) ||
      s.user?.username?.toLowerCase().includes(q)
    );
  });

  const filteredFriends = myFriends.filter((f) => {
    const q = searchTerm.toLowerCase();
    return (
      f.full_name?.toLowerCase().includes(q) ||
      f.username?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-xl shadow-2xl flex flex-col text-white max-h-[88vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-brand-border/80 flex items-center justify-between bg-[#152028]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-emerald to-teal-400 text-brand-dark flex items-center justify-center shadow-lg font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'bn' ? 'মানুষ ও বন্ধু খুঁজুন (কমিউনিটি)' : 'Discover People & Friends'}
              </h3>
              <p className="text-xs text-gray-400">
                {lang === 'bn' ? 'বন্ধু বানান ও সরাসরি যেকোনো ব্যক্তির সাথে চ্যাট করুন' : 'Connect, add friends, and chat with anyone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#202c33] hover:bg-[#2a3942] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher & Search */}
        <div className="p-4 border-b border-brand-border/60 bg-[#0b141a]/60 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'suggestions'
                  ? 'bg-brand-emerald text-brand-dark shadow-sm'
                  : 'bg-[#202c33] text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সবার তালিকা' : 'Discover'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {suggestions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'friends'
                  ? 'bg-brand-emerald text-brand-dark shadow-sm'
                  : 'bg-[#202c33] text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'আমার বন্ধুরা' : 'Friends'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {myFriends.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-brand-emerald text-brand-dark shadow-sm'
                  : 'bg-[#202c33] text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অনুরোধসমূহ' : 'Requests'}</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {(activeTab === 'suggestions' || activeTab === 'friends') && (
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'bn' ? 'নাম বা ইউজারনেম দিয়ে খুঁজুন...' : 'Search by name or username...'}
                className="w-full bg-[#202c33] text-white text-xs rounded-xl pl-9 pr-4 py-2 border border-brand-border focus:outline-none focus:border-brand-emerald"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-brand-border/40 min-h-[260px]">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
              <p className="text-xs">{t.loading}</p>
            </div>
          ) : activeTab === 'requests' ? (
            pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                {lang === 'bn' ? 'কোনো ফ্রেন্ড রিকোয়েস্ট পেন্ডিং নেই।' : 'No pending friend requests.'}
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                  <div 
                    onClick={() => onViewProfile && onViewProfile(req.requester)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                    title={lang === 'bn' ? `${req.requester.full_name} এর প্রোফাইল দেখুন` : 'View Profile'}
                  >
                    <UserAvatar
                      name={req.requester.full_name || req.requester.username}
                      avatarUrl={req.requester.avatar_url}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-emerald transition-colors truncate">{req.requester.full_name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">@{req.requester.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.id, req.requester.id)}
                      className="px-3 py-1.5 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all"
                    >
                      {lang === 'bn' ? 'গ্রহণ করুন' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="p-1.5 rounded-xl bg-[#202c33] text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : activeTab === 'friends' ? (
            filteredFriends.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                {lang === 'bn' ? 'এখনও কোনো ফ্রেন্ড যুক্ত করা হয়নি।' : 'No friends added yet. Connect with people in Discover tab!'}
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div
                    onClick={() => onViewProfile && onViewProfile(friend)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <UserAvatar
                      name={friend.full_name || friend.username}
                      avatarUrl={friend.avatar_url}
                      size="md"
                      showOnline={true}
                      isOnline={friend.is_online}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-emerald transition-colors truncate">
                        {friend.full_name}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate">@{friend.username}</p>
                      {friend.bio && (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{friend.bio}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onStartChat(friend.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all flex-shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                  </button>
                </div>
              ))
            )
          ) : filteredSuggestions.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                {lang === 'bn'
                  ? 'অন্য ডিভাইস বা বন্ধুদের এই প্ল্যাটফর্মে আমন্ত্রণ জানান:'
                  : 'Invite your friends to register and chat:'}
              </p>
              <button
                onClick={handleCopyInviteLink}
                className="px-4 py-2 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs flex items-center gap-2 shadow"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? (lang === 'bn' ? 'লিংক কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'আমন্ত্রণ লিংক কপি করুন' : 'Copy Invite Link')}</span>
              </button>
            </div>
          ) : (
            filteredSuggestions.map((sug) => {
              const u = sug.user;
              const status = sug.friendship_status;

              return (
                <div key={u.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div
                    onClick={() => onViewProfile && onViewProfile(u)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <UserAvatar
                      name={u.full_name || u.username}
                      avatarUrl={u.avatar_url}
                      size="md"
                      showOnline={true}
                      isOnline={u.is_online}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-emerald transition-colors truncate">
                        {u.full_name}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate">@{u.username}</p>
                      {u.bio && (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{u.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Message is ALWAYS available + Friend action */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        onStartChat(u.id);
                        onClose();
                      }}
                      title={lang === 'bn' ? 'সরাসরি চ্যাট শুরু করুন' : 'Start direct chat'}
                      className="px-3 py-1.5 rounded-xl bg-brand-emerald text-brand-dark font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                    </button>

                    {status === 'friends' ? (
                      <span className="px-2.5 py-1.5 rounded-xl bg-[#202c33] text-brand-emerald font-semibold text-[11px] flex items-center gap-1 border border-brand-emerald/30">
                        <Check className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'বন্ধু' : 'Friends'}</span>
                      </span>
                    ) : status === 'pending_sent' ? (
                      <button
                        onClick={() => handleCancelRequest(u.id)}
                        title={lang === 'bn' ? 'অনুরোধ বাতিল করুন' : 'Cancel friend request'}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold text-[11px] flex items-center gap-1 border border-red-500/30 transition-all active:scale-95"
                      >
                        <X className="w-3 h-3 text-red-400" />
                        <span>{lang === 'bn' ? 'বাতিল' : 'Cancel'}</span>
                      </button>
                    ) : status === 'pending_received' ? (
                      <button
                        onClick={() => handleAcceptRequest(sug.friendship_id, u.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-brand-dark font-bold text-[11px] shadow-sm hover:brightness-110 active:scale-95 transition-all"
                      >
                        {lang === 'bn' ? 'গ্রহণ' : 'Accept'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(u.id)}
                        title={lang === 'bn' ? 'ফ্রেন্ড রিকোয়েস্ট পাঠান' : 'Send friend request'}
                        className="p-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-brand-border text-gray-300 hover:text-white transition-all active:scale-95"
                      >
                        <UserPlus className="w-4 h-4 text-sky-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Invite Bar */}
        <div className="p-3.5 border-t border-brand-border bg-[#0b141a] flex items-center justify-between text-xs text-gray-400">
          <span className="text-[11px] truncate">
            {lang === 'bn' ? 'অন্য কাউকে আমন্ত্রণ জানাতে লিংক কপি করুন:' : 'Share invite link with anyone:'}
          </span>
          <button
            onClick={handleCopyInviteLink}
            className="px-3 py-1 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-brand-emerald font-bold text-[11px] flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি লিংক' : 'Copy Link')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
