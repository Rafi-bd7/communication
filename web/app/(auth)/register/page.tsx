'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Lock, User as UserIcon, Mail, Sparkles, Languages, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import UserAvatar from '@/components/common/UserAvatar';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    avatar_url: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploadingAvatar(true);
    setError('');

    try {
      const res = await api.uploadFile(file);
      const serverUrl = res.file_url;
      setFormData((prev) => ({ ...prev, avatar_url: serverUrl }));
    } catch (err: any) {
      setError(lang === 'bn' ? 'ছবি আপলোড করতে ব্যর্থ হয়েছে।' : 'Photo upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        avatar_url: formData.avatar_url || undefined,
      });
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b141a] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-2xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-xs font-bold text-brand-emerald flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
        >
          <Languages className="w-4 h-4" />
          <span>{lang === 'bn' ? 'বাংলা' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-[#111b21] border border-[#2a3942] rounded-3xl p-8 shadow-2xl z-10 animate-fade-in flex flex-col text-white">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-emerald via-emerald-400 to-teal-300 flex items-center justify-center text-brand-dark shadow-xl shadow-brand-emerald/25 mb-2">
            <span className="font-extrabold text-2xl tracking-tight select-none">আ</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {lang === 'bn' ? 'আড্ডায় যোগ দিন' : 'Create an Account'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {lang === 'bn' ? 'স্মার্ট আলাপ, যেকোনো জায়গায়।' : 'Join the real-time communication platform'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* User Photo Upload Section */}
          <div className="flex flex-col items-center mb-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
              title={lang === 'bn' ? 'প্রোফাইল ছবি দিন' : 'Upload profile photo'}
            >
              {avatarPreview || formData.avatar_url ? (
                <img
                  src={avatarPreview || formData.avatar_url}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-brand-emerald shadow-lg group-hover:opacity-85 transition-opacity"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#202c33] border-2 border-dashed border-gray-500 group-hover:border-brand-emerald flex flex-col items-center justify-center text-gray-400 group-hover:text-brand-emerald transition-colors shadow-inner">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">{lang === 'bn' ? 'ছবি দিন' : 'Add Photo'}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-emerald text-brand-dark flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[11px] text-gray-400 mt-2">
              {uploadingAvatar
                ? (lang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading...')
                : (lang === 'bn' ? 'আপনার আসল ছবি আপলোড করতে ট্যাপ করুন (ঐচ্ছিক)' : 'Tap to upload your real photo (optional)')}
            </span>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              {lang === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                required
                className="w-full bg-[#202c33] text-white text-sm rounded-xl pl-10 pr-3.5 py-2.5 border border-[#2a3942] focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              {lang === 'bn' ? 'ইউজারনেম' : 'Username'}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
              placeholder={lang === 'bn' ? 'যেমন: tanvir24' : 'e.g. tanvir24'}
              required
              className="w-full bg-[#202c33] text-white text-sm rounded-xl px-3.5 py-2.5 border border-[#2a3942] focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={lang === 'bn' ? 'আপনার ইমেইল দিন' : 'you@example.com'}
                required
                className="w-full bg-[#202c33] text-white text-sm rounded-xl pl-10 pr-3.5 py-2.5 border border-[#2a3942] focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              {lang === 'bn' ? 'গোপন পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#202c33] text-white text-sm rounded-xl pl-10 pr-3.5 py-2.5 border border-[#2a3942] focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || uploadingAvatar}
            className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 hover:brightness-110 text-brand-dark font-bold text-sm shadow-lg shadow-brand-emerald/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading
              ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...')
              : (lang === 'bn' ? 'রেজিস্টার করুন' : 'Create Account')}
          </button>
        </form>

        <p className="mt-5 text-xs text-gray-400 text-center">
          {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
          <Link href="/login" className="text-brand-emerald font-semibold hover:underline">
            {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  );
}
