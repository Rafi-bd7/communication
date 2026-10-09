'use client';

import { useState, useRef } from 'react';
import { 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Video 
} from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { api } from '@/lib/api';
import { MessageItem } from './MessageBubble';

interface MessageInputProps {
  onSendMessage: (data: {
    content: string;
    message_type?: string;
    reply_to_id?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }) => void;
  replyingTo: MessageItem | null;
  onCancelReply: () => void;
  onTyping: (isTyping: boolean) => void;
}

const COMMON_EMOJIS = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '🙌', '✨', '💯', '😎', '🙏', '😍'];

export function MessageInput({ onSendMessage, replyingTo, onCancelReply, onTyping }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    onTyping(true);

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage({
      content: content.trim(),
      message_type: 'text',
      reply_to_id: replyingTo?.id,
    });
    setContent('');
    onCancelReply();
    onTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowAttachMenu(false);

    try {
      const uploadRes = await api.uploadFile(file);
      onSendMessage({
        content: file.name,
        message_type: uploadRes.message_type || 'file',
        file_url: uploadRes.url,
        file_name: uploadRes.file_name,
        file_size: uploadRes.file_size,
        reply_to_id: replyingTo?.id,
      });
      onCancelReply();
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceRecorded = (fileUrl: string, duration: number) => {
    setIsRecording(false);
    onSendMessage({
      content: 'Voice message',
      message_type: 'audio',
      file_url: fileUrl,
      reply_to_id: replyingTo?.id,
    });
    onCancelReply();
  };

  return (
    <div className="relative bg-brand-surface border-t border-brand-border px-3 py-2.5 select-none">
      {/* Quoted Reply Banner */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded-xl bg-brand-card/80 border-l-4 border-brand-emerald flex items-center justify-between animate-fade-in text-xs">
          <div className="min-w-0 pr-2">
            <span className="font-semibold text-brand-emerald">
              Replying to {replyingTo.sender?.full_name || 'User'}
            </span>
            <p className="text-gray-300 truncate">{replyingTo.content}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-brand-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-brand-card border border-brand-border p-3 rounded-2xl shadow-2xl z-30 flex flex-wrap gap-2 max-w-xs animate-fade-in">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setContent((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Dropdown Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 bg-brand-card border border-brand-border p-2 rounded-2xl shadow-2xl z-30 flex flex-col gap-1 w-44 animate-fade-in text-xs font-medium text-gray-200">
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-surface cursor-pointer text-blue-400 transition-colors">
            <ImageIcon className="w-4 h-4" />
            <span className="text-gray-200">Photos & Videos</span>
            <input
              type="file"
              accept="image/*,video/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.mov"
              onChange={handleFileUploaded}
              className="hidden"
            />
          </label>
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-surface cursor-pointer text-emerald-400 transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-gray-200">Document / File</span>
            <input
              type="file"
              onChange={handleFileUploaded}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Hidden Global File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUploaded}
        className="hidden"
      />

      {/* Audio Recorder Mode vs Text Input Mode */}
      {isRecording ? (
        <AudioRecorder
          onAudioRecorded={handleVoiceRecorded}
          onCancel={() => setIsRecording(false)}
        />
      ) : (
        <div className="flex items-center gap-2">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className={`p-2 rounded-xl transition-colors ${
              showEmojiPicker ? 'text-brand-emerald bg-brand-emerald/10' : 'text-gray-400 hover:text-white'
            }`}
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            disabled={isUploading}
            className={`p-2 rounded-xl transition-colors ${
              showAttachMenu ? 'text-brand-emerald bg-brand-emerald/10' : 'text-gray-400 hover:text-white'
            }`}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isUploading ? 'Uploading attachment...' : 'Type a message...'}
              disabled={isUploading}
              className="w-full bg-brand-card text-white text-sm placeholder-gray-500 rounded-xl px-4 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          {/* Voice Note Button or Send Button */}
          {content.trim() ? (
            <button
              type="button"
              onClick={handleSend}
              className="w-10 h-10 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark flex items-center justify-center shadow-md shadow-brand-emerald/20 transition-all active:scale-95"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              className="w-10 h-10 rounded-xl bg-brand-card hover:bg-brand-card/80 text-gray-300 hover:text-brand-emerald flex items-center justify-center transition-colors"
              title="Record voice note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
