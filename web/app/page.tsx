'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Users, 
  Phone, 
  Video, 
  ShieldCheck, 
  Languages, 
  ArrowRight, 
  Globe, 
  Mic, 
  Lock, 
  Send, 
  Smile, 
  Paperclip, 
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import UserAvatar from '@/components/common/UserAvatar';

export default function HomePage() {
  const { user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col selection:bg-brand-emerald selection:text-brand-dark overflow-x-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[650px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed -bottom-20 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b141a]/85 border-b border-brand-border/60 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-emerald via-emerald-400 to-teal-300 flex items-center justify-center text-brand-dark font-extrabold text-2xl shadow-lg shadow-brand-emerald/25 group-hover:scale-105 transition-transform">
              আ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  {t.brandName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-emerald/15 border border-brand-emerald/30 text-[10px] font-semibold text-brand-emerald">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-400 leading-none mt-0.5">
                {t.brandTagline}
              </p>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-xs font-bold text-brand-emerald flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {user ? (
              <Link
                href="/chat"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 hover:brightness-110 text-brand-dark font-bold text-xs sm:text-sm shadow-md shadow-brand-emerald/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>{lang === 'bn' ? 'আড্ডায় প্রবেশ করুন' : 'Launch Adda'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#202c33] transition-colors"
                >
                  {t.loginBtn}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-400 hover:brightness-110 text-brand-dark font-bold text-xs shadow-md shadow-brand-emerald/20 transition-all active:scale-95"
                >
                  {lang === 'bn' ? 'শুরু করুন' : 'Get Started'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Simple & Beautiful Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111b21] border border-brand-emerald/40 text-brand-emerald text-xs font-semibold mb-6 shadow-lg shadow-brand-emerald/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {lang === 'bn'
                ? 'স্মার্ট যোগাযোগ ও সোশ্যাল প্ল্যাটফর্ম'
                : 'Smart Messaging, Calling & Social Platform'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
            {lang === 'bn' ? (
              <>
                কথা হোক প্রাণখোলা, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald via-emerald-300 to-teal-200">
                  সহজ, নিরাপদ ও সাবলীল।
                </span>
              </>
            ) : (
              <>
                Connect Freely & Securely. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald via-emerald-300 to-teal-200">
                  Anytime, Anywhere.
                </span>
              </>
            )}
          </h1>

          {/* Short Subheading */}
          <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
            {lang === 'bn'
              ? 'তাৎক্ষণিক চ্যাট, এইচডি অডিও-ভিডিও কল, স্টোরিজ এবং সোশ্যাল ফিড—সবকিছু এক প্ল্যাটফর্মে।'
              : 'Real-time chat, HD voice & video calling, 24h stories, and social timeline—all in one unified platform.'}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-emerald via-emerald-400 to-teal-300 hover:brightness-110 text-brand-dark font-extrabold text-sm shadow-xl shadow-brand-emerald/25 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              <span>{lang === 'bn' ? 'আড্ডা শুরু করুন' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-white font-bold text-sm transition-all flex items-center justify-center shadow-md hover:border-gray-500"
            >
              {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </Link>
          </div>

          {/* 3. Interactive Live App Mockup */}
          <div className="mt-14 w-full max-w-4xl text-left relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-emerald/30 via-teal-500/20 to-purple-600/30 rounded-[30px] blur-xl opacity-70" />

            <div className="relative rounded-[26px] bg-[#111b21] border border-brand-border/90 shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-[#0b141a] px-5 py-3 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-3 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                    Adda • {lang === 'bn' ? 'স্মার্ট আড্ডা' : 'Live Chat'}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1">
                  <Lock className="w-3 h-3 text-brand-emerald" />
                  <span>{lang === 'bn' ? 'এন্ড-টু-এন্ড সুরক্ষিত' : 'Secure & Encrypted'}</span>
                </div>
              </div>

              {/* Chat Simulation Body */}
              <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-[#111b21] to-[#0c1317]">
                {/* Incoming Message */}
                <div className="flex items-start gap-3 max-w-md">
                  <UserAvatar name="তানভীর আহমেদ" size="sm" />
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#202c33] border border-brand-border/60 text-xs text-gray-200 shadow">
                    <p className="font-bold text-brand-emerald text-[11px] mb-1">তানভীর আহমেদ</p>
                    <p>আজকের আড্ডাটা দারুণ ছিল! কাল বিকেলে ভিডিও কলে সবাই আসছ তো?</p>
                    <span className="text-[10px] text-gray-400 mt-1 block text-right">সন্ধ্যা ৬:৩০</span>
                  </div>
                </div>

                {/* Outgoing Message */}
                <div className="flex items-end justify-end gap-2">
                  <div className="p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs max-w-md shadow-md">
                    <p>হ্যাঁ একদম! আমি সময়মতো জয়েন করব। লিংক পাঠিয়ে রেখো। 👍</p>
                    <span className="text-[10px] text-emerald-200 mt-1 flex items-center justify-end gap-1">
                      <span>সন্ধ্যা ৬:৩২</span>
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
                    </span>
                  </div>
                </div>

                {/* Live Audio Note Simulation */}
                <div className="flex items-start gap-3 max-w-sm">
                  <UserAvatar name="সাদিয়া হক" size="sm" />
                  <div 
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="p-3 rounded-2xl bg-[#202c33] border border-brand-border/60 text-xs text-gray-200 flex items-center gap-3 cursor-pointer hover:bg-[#28373f] transition-colors shadow"
                  >
                    <button className="w-8 h-8 rounded-full bg-brand-emerald text-brand-dark flex items-center justify-center font-bold shadow">
                      {isPlayingAudio ? '❚❚' : '▶'}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 h-4">
                        {[30, 60, 40, 80, 50, 90, 60, 100, 40, 70, 85, 40, 60].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full bg-emerald-400 transition-all ${
                              isPlayingAudio ? 'animate-pulse' : ''
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block">ভয়েস মেসেজ (০:১৮)</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Input Bar */}
                <div className="pt-3 border-t border-brand-border/50 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-gray-400" />
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    value={lang === 'bn' ? 'আড্ডায় আপনাকে স্বাগতম! ☕' : 'Welcome to Adda!'}
                    className="flex-1 bg-[#202c33] text-white text-xs rounded-xl px-3.5 py-2 border border-brand-border focus:outline-none cursor-default"
                  />
                  <div className="w-8 h-8 rounded-xl bg-brand-emerald text-brand-dark flex items-center justify-center shadow">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Four Clean Features Cards (No Long Essays) */}
      <section className="py-16 bg-[#111b21]/60 border-t border-brand-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Chat */}
            <div className="p-6 rounded-3xl bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/40 transition-all shadow-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-brand-emerald flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {lang === 'bn' ? 'দ্রুতগতির চ্যাট' : 'Instant Chat'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {lang === 'bn' ? 'তাৎক্ষণিক মেসেজ, ছবি, অডিও ও ফাইল শেয়ারিং।' : 'Real-time messaging, photos, voice notes & files.'}
              </p>
            </div>

            {/* Card 2: Calls */}
            <div className="p-6 rounded-3xl bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/40 transition-all shadow-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {lang === 'bn' ? 'এইচডি কলিং' : 'HD Voice & Video'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {lang === 'bn' ? 'ক্রিস্টাল ক্লিয়ার অডিও ও ভিডিও কলিং সুবিধা।' : 'Crystal-clear audio and video calling with zero lag.'}
              </p>
            </div>

            {/* Card 3: Social Feed */}
            <div className="p-6 rounded-3xl bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/40 transition-all shadow-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {lang === 'bn' ? 'সোশ্যাল টাইমলাইন' : 'Social Timeline'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {lang === 'bn' ? 'পোস্ট, অনুভূতি শেয়ার, ২৪ ঘণ্টার স্টোরিজ ও ফ্রেন্ডস।' : 'Share updates, 24h stories, and connect with friends.'}
              </p>
            </div>

            {/* Card 4: Security */}
            <div className="p-6 rounded-3xl bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/40 transition-all shadow-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {lang === 'bn' ? 'নিরাপদ ও প্রাইভেট' : 'Private & Secure'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {lang === 'bn' ? 'আপনার ডেটা ও প্রোফাইল সম্পূর্ণ সুরক্ষিত।' : 'Advanced encryption keeping your personal data secure.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Minimal Clean Footer */}
      <footer className="mt-auto py-8 bg-[#0b141a] border-t border-brand-border/40 text-center text-xs text-gray-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-brand-emerald text-brand-dark flex items-center justify-center font-black text-xs">আ</span>
            <span className="font-bold text-white">Adda</span>
            <span className="text-gray-500">• {t.brandTagline}</span>
          </div>

          <p className="text-gray-400 text-[11px]">
            © {new Date().getFullYear()} Adda Communication. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-gray-400 text-[11px]">
            <Link href="/login" className="hover:text-white transition-colors">{t.loginBtn}</Link>
            <Link href="/register" className="hover:text-white transition-colors">{lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
