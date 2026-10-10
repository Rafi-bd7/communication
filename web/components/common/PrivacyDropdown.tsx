'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Users, ChevronDown, Check } from 'lucide-react';

export type PrivacyOption = 'public' | 'friends';

interface PrivacyDropdownProps {
  value: PrivacyOption;
  onChange: (value: PrivacyOption) => void;
  lang?: 'bn' | 'en';
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
}

export function PrivacyDropdown({
  value,
  onChange,
  lang = 'bn',
  size = 'sm',
  align = 'left',
  className = '',
}: PrivacyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: PrivacyOption) => {
    onChange(val);
    setIsOpen(false);
  };

  const isPublic = value === 'public';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* 3D Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative flex items-center gap-1.5 rounded-xl border transition-all duration-200 select-none btn-3d-secondary ${
          size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        } ${
          isPublic
            ? 'bg-[#18242c] hover:bg-[#202f3a] text-emerald-300 border-emerald-500/30'
            : 'bg-[#18242c] hover:bg-[#202f3a] text-sky-300 border-sky-500/30'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {isPublic ? (
          <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
        ) : (
          <Users className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
        )}

        <span className="font-semibold tracking-wide">
          {isPublic
            ? lang === 'bn'
              ? 'পাবলিক'
              : 'Public'
            : lang === 'bn'
            ? 'শুধু বন্ধুরা'
            : 'Friends Only'}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180 opacity-100' : ''
          }`}
        />
      </button>

      {/* 3D Floating Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 z-50 w-64 rounded-2xl p-1.5 card-3d-floating bg-[#141e26]/95 border border-[#2a3c4a] backdrop-blur-xl animate-fade-in`}
          role="listbox"
        >
          {/* Header Tag */}
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/5 mb-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'পোস্টের গোপনীয়তা' : 'Post Audience'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
          </div>

          {/* Option: Public */}
          <button
            type="button"
            onClick={() => handleSelect('public')}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group ${
              isPublic
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                : 'hover:bg-white/5 text-gray-300 border border-transparent'
            }`}
            role="option"
            aria-selected={isPublic}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isPublic
                    ? 'bg-emerald-500/25 text-emerald-300 shadow-sm shadow-emerald-500/30'
                    : 'bg-[#202c33] text-gray-400 group-hover:text-emerald-400'
                }`}
              >
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">
                  {lang === 'bn' ? 'পাবলিক' : 'Public'}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight mt-0.5">
                  {lang === 'bn' ? 'আড্ডার সবাই দেখতে পারবে' : 'Anyone on Adda'}
                </span>
              </div>
            </div>
            {isPublic && (
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Option: Friends Only */}
          <button
            type="button"
            onClick={() => handleSelect('friends')}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group mt-1 ${
              !isPublic
                ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                : 'hover:bg-white/5 text-gray-300 border border-transparent'
            }`}
            role="option"
            aria-selected={!isPublic}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  !isPublic
                    ? 'bg-sky-500/25 text-sky-300 shadow-sm shadow-sky-500/30'
                    : 'bg-[#202c33] text-gray-400 group-hover:text-sky-400'
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">
                  {lang === 'bn' ? 'শুধু বন্ধুরা' : 'Friends Only'}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight mt-0.5">
                  {lang === 'bn' ? 'পারস্পরিক বন্ধুরা দেখতে পারবে' : 'Mutual friends only'}
                </span>
              </div>
            </div>
            {!isPublic && (
              <div className="w-5 h-5 rounded-full bg-sky-500/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-sky-400 stroke-[3]" />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
