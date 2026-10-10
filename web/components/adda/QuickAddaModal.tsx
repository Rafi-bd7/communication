'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Users, Check, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import { ConversationItem } from '@/components/chat/ChatList';
import UserAvatar from '@/components/common/UserAvatar';

interface QuickAddaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (conv: ConversationItem) => void;
}

export function QuickAddaModal({ isOpen, onClose, onRoomCreated }: QuickAddaModalProps) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('friends');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const topicOptions = [
    { id: 'friends', label: t.topicFriends, icon: '☕' },
    { id: 'study', label: t.topicStudy, icon: '📚' },
    { id: 'work', label: t.topicWork, icon: '💼' },
    { id: 'project', label: t.topicProject, icon: '🚀' },
  ];

  useEffect(() => {
    if (isOpen) {
      api.listUsers()
        .then((users) => setAvailableUsers(users))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedTopicObj = topicOptions.find(t => t.id === selectedTopic);
      const roomTitle = `${selectedTopicObj?.icon ? selectedTopicObj.icon + ' ' : ''}${name.trim()}`;
      
      const newConv = await api.createGroupChat({
        name: roomTitle,
        member_ids: selectedUserIds,
      });

      onRoomCreated(newConv);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyDummyLink = () => {
    const dummyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigator.clipboard.writeText(`${window.location.origin}/chat?room=${dummyCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-lg overflow-hidden card-3d-floating animate-fade-in text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-[#182229]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-emerald to-emerald-400 text-brand-dark flex items-center justify-center shadow-lg shadow-brand-emerald/20 font-bold btn-3d">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t.quickAddaTitle}</h3>
              <p className="text-xs text-gray-400">{t.quickAddaSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              {t.roomName} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.roomNamePlaceholder}
              className="w-full bg-[#202c33] border border-brand-border rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 input-3d transition-colors"
              autoFocus
            />
          </div>

          {/* Topic Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              {t.selectTopic}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {topicOptions.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedTopic === topic.id
                      ? 'bg-gradient-to-r from-brand-emerald to-teal-400 text-brand-dark btn-3d'
                      : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942] border border-brand-border btn-3d-secondary'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {lang === 'bn' ? 'সদস্য যুক্ত করুন' : 'Add Members'}
              </label>
              <span className="text-xs text-brand-emerald font-medium">
                {selectedUserIds.length} {lang === 'bn' ? 'জন নির্বাচিত' : 'selected'}
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {availableUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-emerald/15 border border-brand-emerald/30' : 'bg-[#202c33]/70 hover:bg-[#202c33] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={u.full_name || u.username}
                        avatarUrl={u.avatar_url}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{u.full_name || u.username}</p>
                        <p className="text-[10px] text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-brand-emerald border-brand-emerald text-brand-dark' : 'border-gray-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite Code Feature */}
          <div className="p-3.5 rounded-2xl bg-[#182229] border border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles className="w-4 h-4 text-brand-emerald" />
              <span>{lang === 'bn' ? 'লিংক দিয়ে সবাইকে ইনভাইট করুন' : 'Invite anyone via quick link'}</span>
            </div>
            <button
              type="button"
              onClick={copyDummyLink}
              className="px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-brand-emerald flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : t.copyInviteLink}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 text-brand-dark font-extrabold text-xs flex items-center gap-2 btn-3d disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isSubmitting ? t.loading : t.createRoomBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
