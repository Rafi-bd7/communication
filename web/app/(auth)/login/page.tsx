'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User as UserIcon, Languages, KeyRound, X, CheckCircle, Phone, Mail, ShieldCheck, ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot / Reset Password Modal State (OTP Flow)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpInfo, setSentOtpInfo] = useState<{ destination: string; channel: string; code?: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleOpenForgotModal = () => {
    setResetStep(1);
    setResetIdentifier(usernameOrEmail || '');
    setOtpCode('');
    setSentOtpInfo(null);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
    setShowForgotModal(true);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetIdentifier.trim()) {
      setResetError(lang === 'bn' ? 'ইউজারনেম, ইমেইল বা ফোন নম্বর লিখুন' : 'Please enter your username, email, or phone number');
      return;
    }

    setResetError('');
    setIsSendingCode(true);

    try {
      const res = await api.sendResetCode(resetIdentifier.trim());
      setSentOtpInfo(res);
      if (res.code) {
        setOtpCode(res.code);
      }
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.message || (lang === 'bn' ? 'কোড পাঠানো যায়নি।' : 'Could not send verification code.'));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setResetError(lang === 'bn' ? 'সঠিক ৬ সংখ্যার ভেরিফিকেশন কোড দিন।' : 'Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError(lang === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError(lang === 'bn' ? 'দুইটি পাসওয়ার্ড মিলছে না!' : 'Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      await api.resetPassword({
        identifier: resetIdentifier.trim(),
        code: otpCode.trim(),
        new_password: newPassword,
      });

      setResetSuccess(
        lang === 'bn' 
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! এখন লগইন করুন।' 
          : 'Password reset successfully! You can now log in.'
      );
      setUsernameOrEmail(resetIdentifier.trim());
      setPassword('');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetSuccess('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || (lang === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Password reset failed.'));
    } finally {
      setIsResetting(false);
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
          <img
            src="/logo.png"
            alt="Adda Logo"
            className="w-20 h-20 rounded-3xl object-cover shadow-2xl shadow-brand-emerald/30 border border-brand-emerald/40 mb-3"
          />
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">{t.password}</label>
              <button
                type="button"
                onClick={() => {
                  setResetIdentifier(usernameOrEmail);
                  setResetError('');
                  setResetSuccess('');
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-semibold text-brand-emerald hover:underline"
              >
                {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
              </button>
            </div>
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

      {/* Forgot / Reset Password Modal (2-Step OTP Verification) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-md p-6 shadow-2xl text-white animate-fade-in relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2a3942] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-emerald/15 flex items-center justify-center text-brand-emerald">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {lang === 'bn' ? 'পাসওয়ার্ড রিসেট ও ভেরিফিকেশন' : 'Password Reset & Verification'}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {resetStep === 1 
                      ? (lang === 'bn' ? 'ধাপ ১: কোড পাঠান' : 'Step 1: Request Code')
                      : (lang === 'bn' ? 'ধাপ ২: ভেরিফিকেশন কোড ও নতুন পাসওয়ার্ড' : 'Step 2: Enter Code & New Password')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="py-8 flex flex-col items-center text-center gap-3 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-brand-emerald shadow-lg shadow-emerald-500/10">
                  <CheckCircle className="w-8 h-8 text-brand-emerald" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password Reset Successfully!'}
                </h4>
                <p className="text-xs text-gray-300 max-w-xs">{resetSuccess}</p>
              </div>
            ) : resetStep === 1 ? (
              /* STEP 1: Enter Identifier & Send Verification Code */
              <form onSubmit={handleSendCode} className="flex flex-col gap-4 text-xs">
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  {lang === 'bn' 
                    ? 'আপনার অ্যাকাউন্টের ইউজারনেম, ইমেইল বা ফোন নম্বর দিন। আপনার অ্যাকাউন্টে একটি ৬ সংখ্যার ভেরিফিকেশন কোড পাঠানো হবে।' 
                    : 'Enter your registered username, email, or phone. A 6-digit verification code will be sent to your account.'}
                </p>

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-center text-xs">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="text-gray-300 font-semibold block mb-1.5 text-xs">
                    {lang === 'bn' ? 'ইউজারনেম, ইমেইল বা ফোন নম্বর *' : 'Username, Email, or Phone *'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      required
                      placeholder={lang === 'bn' ? 'যেমন: user123, user@mail.com বা 017...' : 'e.g. user123, user@mail.com or +8801...'}
                      className="w-full bg-[#202c33] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-brand-border bg-[#202c33] hover:bg-[#2a3942] text-gray-300 font-bold transition-all"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 hover:brightness-110 text-brand-dark font-bold shadow-md shadow-brand-emerald/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSendingCode ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'ভেরিফিকেশন কোড পাঠান' : 'Send Code'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: Enter 6-digit OTP & Set New Password */
              <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5 text-xs animate-fade-in">
                {/* Sent Confirmation Badge */}
                {sentOtpInfo && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-emerald-500/20 text-brand-emerald flex items-center justify-center flex-shrink-0">
                      {sentOtpInfo.channel === 'phone' ? <Phone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-gray-300">
                        {lang === 'bn' ? 'কোড পাঠানো হয়েছে:' : 'Verification code sent to:'}{' '}
                        <span className="font-bold text-white">{sentOtpInfo.destination}</span>
                      </p>
                      {sentOtpInfo.code && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-brand-emerald font-mono font-bold tracking-widest text-xs">
                            {sentOtpInfo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(sentOtpInfo.code || '')}
                            className="text-[10px] text-brand-emerald hover:underline font-semibold"
                          >
                            {lang === 'bn' ? 'কোড বসান' : 'Apply Code'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-center text-xs">
                    {resetError}
                  </div>
                )}

                {/* 6-Digit Code Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-300 font-semibold text-xs">
                      {lang === 'bn' ? '৬ ডিজিটের ভেরিফিকেশন কোড *' : '6-Digit Verification Code *'}
                    </label>
                    <button
                      type="button"
                      disabled={isSendingCode}
                      onClick={() => handleSendCode()}
                      className="text-[10px] text-brand-emerald hover:underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isSendingCode ? 'animate-spin' : ''}`} />
                      <span>{lang === 'bn' ? 'কোড আবার পাঠান' : 'Resend Code'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="123456"
                      className="w-full bg-[#202c33] text-white text-sm font-mono tracking-widest text-center rounded-xl py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald transition-colors"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-gray-300 font-semibold block mb-1 text-xs">
                    {lang === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'New Password (min 6 chars) *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#202c33] text-white text-xs rounded-xl pl-9 pr-9 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-gray-300 font-semibold block mb-1 text-xs">
                    {lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm New Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#202c33] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setResetError('');
                    }}
                    className="px-3 py-2.5 rounded-xl border border-brand-border bg-[#202c33] hover:bg-[#2a3942] text-gray-300 font-bold transition-all flex items-center justify-center gap-1"
                    title={lang === 'bn' ? 'পেছনে যান' : 'Back'}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'bn' ? 'পেছনে' : 'Back'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 hover:brightness-110 text-brand-dark font-bold shadow-md shadow-brand-emerald/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isResetting 
                      ? (lang === 'bn' ? 'রিসেট হচ্ছে...' : 'Resetting...') 
                      : (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Confirm & Reset Password')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
