'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export interface SavedMessageItem {
  id: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  savedAt: string;
  category?: 'important' | 'media' | 'links';
}

interface MessageCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMessages: SavedMessageItem[];
  onRemoveMessage: (id: string) => void;
}

export function MessageCollectionsModal({
  isOpen,
  onClose,
  savedMessages,
  onRemoveMessage,
}: MessageCollectionsModalProps) {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'important' | 'media' | 'links'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedMessages.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in text-white flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-[#182229]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-md">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t.collectionsTitle}</h3>
              <p className="text-xs text-gray-400">{t.collectionsSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111b21]">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: t.allCollections, icon: MessageSquare },
              { id: 'important', label: t.importantTab, icon: Sparkles },
              { id: 'media', label: t.mediaTab, icon: ImageIcon },
              { id: 'links', label: t.linksTab, icon: LinkIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-emerald text-brand-dark font-bold shadow-sm'
                      : 'bg-[#202c33] text-gray-300 hover:bg-[#2a3942]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'খুঁজুন...' : 'Search...'}
              className="w-full bg-[#202c33] border border-brand-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Bookmark className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
                {t.noSavedMessages}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-[#182229] border border-brand-border hover:border-brand-emerald/40 rounded-2xl p-4 transition-all flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3 flex-1">
                  <img
                    src={item.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.senderName}`}
                    alt={item.senderName}
                    className="w-9 h-9 rounded-full bg-[#202c33] object-cover mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white">{item.senderName}</h4>
                      <span className="text-[10px] text-gray-400 font-normal">{item.savedAt}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed break-words bg-[#202c33]/50 p-2.5 rounded-xl border border-brand-border/40">
                      {item.content}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveMessage(item.id)}
                  title={t.delete}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
