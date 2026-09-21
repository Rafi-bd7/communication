'use client';

import { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#ea580c', // Orange
  '#111827', // Slate dark
];

export function CreateStatusModal({ isOpen, onClose, onCreated }: CreateStatusModalProps) {
  const [mode, setMode] = useState<'text' | 'media'>('text');
  const [caption, setCaption] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMode('media');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaFile) return;

    setIsSubmitting(true);
    try {
      let mediaUrl = undefined;
      let mediaType = 'text';

      if (mediaFile) {
        const uploadRes = await api.uploadFile(mediaFile);
        mediaUrl = uploadRes.url;
        mediaType = uploadRes.message_type || 'image';
      }

      await api.createStatus({
        caption: caption.trim() || undefined,
        media_url: mediaUrl,
        media_type: mediaType,
        background_color: mode === 'text' ? selectedColor : undefined,
      });

      setCaption('');
      setMediaFile(null);
      setMediaPreview(null);
      onCreated();
      onClose();
    } catch (err) {
      alert('Failed to share story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between text-white">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-emerald" />
            Add to 24h Story
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-brand-border bg-brand-dark/40">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              mode === 'text' ? 'text-brand-emerald border-b-2 border-brand-emerald bg-brand-emerald/10' : 'text-gray-400'
            }`}
          >
            Text Story
          </button>
          <button
            type="button"
            onClick={() => setMode('media')}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              mode === 'media' ? 'text-brand-emerald border-b-2 border-brand-emerald bg-brand-emerald/10' : 'text-gray-400'
            }`}
          >
            Photo / Video
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {mode === 'text' ? (
            <div
              className="h-56 rounded-2xl p-4 flex flex-col justify-center items-center shadow-inner transition-colors"
              style={{ backgroundColor: selectedColor }}
            >
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Type your story update..."
                maxLength={200}
                className="w-full bg-transparent text-white placeholder-white/60 text-center text-lg font-medium resize-none focus:outline-none"
                rows={4}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mediaPreview ? (
                <div className="relative h-56 rounded-2xl overflow-hidden bg-brand-dark flex items-center justify-center border border-brand-border">
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="h-56 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-emerald/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-brand-dark/30">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                  <span className="text-sm text-gray-300 font-medium">Click to select photo or video</span>
                  <span className="text-xs text-gray-500">Supports PNG, JPG, MP4</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)..."
                className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-emerald"
              />
            </div>
          )}

          {/* Color palette for text mode */}
          {mode === 'text' && (
            <div className="flex items-center justify-center gap-2.5 pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (!caption.trim() && !mediaFile)}
            className="mt-2 w-full py-3 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-emerald/20"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sharing...' : 'Share to Story'}
          </button>
        </form>
      </div>
    </div>
  );
}
