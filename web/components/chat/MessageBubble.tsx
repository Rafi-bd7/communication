'use client';

import { useState, useRef } from 'react';
import { 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  FileText, 
  Download, 
  CornerUpLeft, 
  MoreVertical, 
  Languages, 
  Trash2, 
  Edit3, 
  Smile,
  Bookmark 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export interface ReactionItem {
  id: string;
  user_id: string;
  emoji: string;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  edited_at?: string;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  reactions: ReactionItem[];
  reply_to?: {
    id: string;
    content: string;
    sender_name: string;
  };
}

interface MessageBubbleProps {
  message: MessageItem;
  onReply: (message: MessageItem) => void;
  onEdit: (message: MessageItem) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onBookmark?: (message: MessageItem) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '😮', '😢'];

export function MessageBubble({ message, onReply, onEdit, onDelete, onReact, onBookmark }: MessageBubbleProps) {
  const { user } = useAuth();
  const isMe = message.sender_id === user?.id;

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Translation State
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Menu Dropdown
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(p || 0);
    }
  };

  const handleTranslate = async (lang: string = 'Bangla') => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await api.translateText(message.content, lang);
      setTranslatedText(res.result);
    } catch (err) {
      alert('Translation failed');
    } finally {
      setIsTranslating(false);
      setShowMenu(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Group reactions count (safe fallback for undefined reactions)
  const reactionCounts = (message.reactions ?? []).reduce((acc: Record<string, number>, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`flex w-full my-1.5 ${isMe ? 'justify-end' : 'justify-start'} group select-text`}>
      <div className={`relative max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Hover Action Bar */}
        <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-brand-surface/90 border border-brand-border px-2 py-1 rounded-full shadow-lg backdrop-blur-sm z-10 animate-fade-in`}>
          {/* Quick Reaction buttons */}
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(message.id, emoji)}
              className="hover:scale-125 transition-transform px-0.5 text-sm"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
          <div className="w-[1px] h-3.5 bg-brand-border mx-1" />
          <button
            type="button"
            onClick={() => onReply(message)}
            title="Reply"
            className="text-gray-400 hover:text-white p-1"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleTranslate('Bangla')}
            title="Translate with AI"
            className="text-gray-400 hover:text-purple-400 p-1"
          >
            <Languages className="w-3.5 h-3.5" />
          </button>
          {onBookmark && (
            <button
              type="button"
              onClick={() => onBookmark(message)}
              title="সংগ্রহে রাখুন / Bookmark"
              className="text-gray-400 hover:text-amber-400 p-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}
          {isMe && (
            <>
              <button
                type="button"
                onClick={() => onEdit(message)}
                title="Edit"
                className="text-gray-400 hover:text-white p-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(message.id)}
                title="Delete"
                className="text-gray-400 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Message Bubble Container */}
        <div
          className={`px-3.5 py-2 rounded-2xl relative card-3d ${
            isMe
              ? 'bg-brand-bubbleOutgoing text-white rounded-tr-none shadow-md'
              : 'bg-brand-bubbleIncoming text-gray-100 rounded-tl-none border border-brand-border/40 shadow-md'
          }`}
        >
          {/* Group Chat Sender Name */}
          {!isMe && message.sender && (
            <span className="text-[11px] font-semibold text-brand-emerald block mb-0.5">
              {message.sender.full_name}
            </span>
          )}

          {/* Quoted Reply Preview */}
          {message.reply_to && (
            <div className="mb-2 p-2 rounded-lg bg-black/20 border-l-4 border-brand-emerald text-xs text-gray-300">
              <span className="font-semibold text-brand-emerald block text-[11px]">
                {message.reply_to.sender_name}
              </span>
              <p className="truncate line-clamp-1">{message.reply_to.content}</p>
            </div>
          )}

          {/* Media Attachments */}
          {message.message_type === 'image' && message.file_url && (
            <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
              <img
                src={message.file_url}
                alt="Image"
                className="w-full max-h-80 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.file_url, '_blank')}
              />
            </div>
          )}

          {message.message_type === 'video' && message.file_url && (
            <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
              <video
                src={message.file_url}
                controls
                className="w-full max-h-80 rounded-xl"
              />
            </div>
          )}

          {/* Voice Note Player */}
          {message.message_type === 'audio' && message.file_url && (
            <div className="flex items-center gap-3 py-1 min-w-[200px] md:min-w-[240px]">
              <audio
                ref={audioRef}
                src={message.file_url}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => { setIsPlaying(false); setAudioProgress(0); }}
                className="hidden"
              />
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-10 h-10 rounded-full bg-brand-emerald text-brand-dark flex items-center justify-center flex-shrink-0 shadow transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <div className="flex-1 flex flex-col gap-1">
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-emerald h-full transition-all duration-100"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-300 font-mono">Voice note</span>
              </div>
            </div>
          )}

          {/* Document Attachment */}
          {message.message_type === 'file' && message.file_url && (
            <div className="flex items-center gap-3 p-2.5 my-1 bg-black/20 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-brand-emerald flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-medium text-white truncate">{message.file_name || 'Document'}</p>
                <span className="text-[10px] text-gray-400">
                  {message.file_size ? `${Math.round(message.file_size / 1024)} KB` : 'Attachment'}
                </span>
              </div>
              <a
                href={message.file_url}
                download={message.file_name || 'download'}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed pr-12">
              {message.content}
            </p>
          )}

          {/* Translation Result Banner */}
          {translatedText && (
            <div className="mt-2 pt-2 border-t border-purple-400/30 text-xs text-purple-200 font-medium">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-0.5">
                AI Translation:
              </span>
              {translatedText}
            </div>
          )}

          {/* Bottom Timestamp & Status */}
          <div className="flex items-center justify-end gap-1 text-[10px] text-gray-300/80 -mt-1 float-right pl-2">
            {message.is_edited && <span className="italic text-gray-400">edited</span>}
            <span>{formatTime(message.created_at)}</span>
            {isMe && (
              <span className="text-brand-emerald ml-0.5">
                <CheckCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges Pill */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex items-center gap-1 -mt-2 bg-brand-surface border border-brand-border px-1.5 py-0.5 rounded-full shadow-md z-10">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span key={emoji} className="text-xs flex items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform">
                {emoji}
                {count > 1 && <span className="text-[10px] text-gray-300">{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
