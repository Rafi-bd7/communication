'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Lock, User as UserIcon, Sparkles, Languages } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username_or_email: usernameOrEmail, password });
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (userKey: string) => {
    setError('');
    setIsLoading(true);
    try {
      await login({ username_or_email: userKey, password: 'password123' });
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b141a] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher at Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-2xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-xs font-bold text-brand-emerald flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
        >
          <Languages className="w-4 h-4" />
          <span>{lang === 'bn' ? 'বাংলা' : 'English'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#111b21] border border-[#2a3942] rounded-3xl p-8 shadow-2xl z-10 animate-fade-in flex flex-col text-white">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-emerald via-emerald-400 to-teal-300 flex items-center justify-center text-brand-dark shadow-xl shadow-brand-emerald/25 mb-3">
            <span className="font-extrabold text-2xl tracking-tight select-none">আ</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t.brandName}</h1>
          <p className="text-xs font-medium text-brand-emerald mt-1">{t.brandTagline}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{t.brandSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">{t.usernameOrEmail}</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder={lang === 'bn' ? 'ইউজারনেম বা ইমেইল লিখুন' : 'username or email'}
                required
                className="w-full bg-[#202c33] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-[#2a3942] focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">{t.password}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#202c33] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-[#2a3942] focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 hover:brightness-110 text-brand-dark font-bold text-sm shadow-lg shadow-brand-emerald/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? t.loading : t.loginBtn}
          </button>
        </form>

        {/* Register Navigation Link */}
        <p className="mt-6 text-xs text-gray-400 text-center">
          {lang === 'bn' ? 'আপনার কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
          <Link href="/register" className="text-brand-emerald font-bold hover:underline">
            {lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'}
          </Link>
        </p>

        {/* Brand Microcopy */}
        <p className="mt-6 text-[11px] text-gray-500 text-center">
          Adda • {t.brandTagline}
        </p>
      </div>
    </div>
  );
}
