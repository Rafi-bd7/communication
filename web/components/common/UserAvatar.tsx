'use client';

import { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnline?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-16 h-16 text-xl font-bold',
  '2xl': 'w-24 h-24 text-3xl font-extrabold',
};

const dotSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

const gradientPalettes = [
  'from-emerald-600 to-teal-800 text-white',
  'from-blue-600 to-indigo-800 text-white',
  'from-violet-600 to-purple-800 text-white',
  'from-rose-600 to-pink-800 text-white',
  'from-amber-600 to-orange-800 text-white',
  'from-cyan-600 to-blue-800 text-white',
  'from-teal-600 to-emerald-900 text-white',
];

function getPalette(name: string): string {
  if (!name) return gradientPalettes[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradientPalettes[Math.abs(hash) % gradientPalettes.length];
}

function getInitial(name?: string): string {
  if (!name || !name.trim()) return 'আ';
  const clean = name.trim();
  // Support both Bangla and English letters
  return clean.charAt(0).toUpperCase();
}

export default function UserAvatar({
  name = 'ইউজার',
  avatarUrl,
  size = 'md',
  showOnline = false,
  isOnline = false,
  className = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const dotSize = dotSizes[size] || dotSizes.md;
  const initial = getInitial(name);
  const palette = getPalette(name);

  // If avatarUrl exists and is not dicebear cartoon
  const isValidPhoto = Boolean(
    avatarUrl &&
    avatarUrl.trim() !== '' &&
    !avatarUrl.includes('dicebear.com') &&
    !imgError
  );

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${sizeClass} ${className}`}>
      {isValidPhoto ? (
        <img
          src={avatarUrl!}
          alt={name}
          onError={() => setImgError(true)}
          className={`w-full h-full rounded-full object-cover shadow-sm bg-[#1e293b] border border-white/10`}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-tr ${palette} flex items-center justify-center shadow-sm border border-white/10 select-none tracking-wide`}
        >
          <span>{initial}</span>
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-2 border-[#111b21] ${
            isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-gray-500'
          }`}
        />
      )}
    </div>
  );
}
