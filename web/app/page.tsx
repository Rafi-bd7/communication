'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Users, 
  Phone, 
  Video, 
  ShieldCheck, 
  Smartphone, 
  Languages, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Bookmark, 
  Heart,
  Globe,
  Mic,
  Play,
  Volume2,
  Lock,
  ChevronRight,
  Send,
  Smile,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import UserAvatar from '@/components/common/UserAvatar';

export default function HomePage() {
  const { user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'chat' | 'calls' | 'board' | 'security'>('chat');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [pollVoted, setPollVoted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col selection:bg-brand-emerald selection:text-brand-dark overflow-x-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[650px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed -bottom-20 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b141a]/85 border-b border-brand-border/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
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

          {/* Desktop Formal Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#solutions" className="hover:text-brand-emerald transition-colors">
              {lang === 'bn' ? 'সমাধানসমূহ' : 'Solutions'}
            </a>
            <a href="#interactive-preview" className="hover:text-brand-emerald transition-colors">
              {lang === 'bn' ? 'লাইভ অভিজ্ঞতা' : 'Experience'}
            </a>
            <a href="#capabilities" className="hover:text-brand-emerald transition-colors">
              {lang === 'bn' ? 'বৈশিষ্ট্য' : 'Capabilities'}
            </a>
            <a href="#enterprise-security" className="hover:text-brand-emerald transition-colors">
              {lang === 'bn' ? 'নিরাপত্তা' : 'Security'}
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-xs font-bold text-brand-emerald flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বাংলা' : 'English'}</span>
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
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#202c33] transition-colors"
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

      {/* 2. Formal Hero Section */}
      <section className="relative pt-14 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          
          {/* Formal Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111b21] border border-brand-emerald/40 text-brand-emerald text-xs font-semibold mb-6 shadow-lg shadow-brand-emerald/5 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {lang === 'bn'
                ? 'আধুনিক কমিউনিটি ও রিয়েল-টাইম যোগাযোগ প্ল্যাটফর্ম'
                : 'Next-Generation Real-Time Communication Platform'}
            </span>
          </div>

          {/* Elegant Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
            {lang === 'bn' ? (
              <>
                যোগাযোগের নতুন দিগন্ত। <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald via-emerald-300 to-teal-200">
                  সহজ, নিরাপদ ও সাবলীল।
                </span>
              </>
            ) : (
              <>
                Redefining Conversations. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald via-emerald-300 to-teal-200">
                  Seamless, Private & Scalable.
                </span>
              </>
            )}
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl font-normal leading-relaxed">
            {lang === 'bn'
              ? 'ব্যক্তিগত ঘনিষ্ঠ আলাপচারিতা থেকে শুরু করে বৃহৎ দলগত আলোচনা—সবকিছুর জন্য একটি সমন্বিত ও নির্ভরযোগ্য মাধ্যম। অডিও-ভিডিও কল, তাৎক্ষণিক বার্তা এবং যৌথ কর্মপরিকল্পনা ব্যবস্থাপনা।'
              : 'From intimate personal conversations to expansive team collaborations—engineered to deliver instant messaging, crystal-clear calls, and collaborative shared boards with zero compromise on privacy.'}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-emerald via-emerald-400 to-teal-300 hover:brightness-110 text-brand-dark font-extrabold text-base shadow-xl shadow-brand-emerald/25 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <span>{lang === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-white font-bold text-base transition-all flex items-center justify-center shadow-md hover:border-gray-500"
            >
              {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </Link>
          </div>

          {/* Institutional Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl w-full">
            <div className="p-4 rounded-2xl bg-[#111b21]/70 border border-brand-border/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-white block">১০০০+</span>
              <span className="text-xs text-gray-400">
                {lang === 'bn' ? 'সদস্য গ্রুপ ক্যাপাসিটি' : 'Group Capacity'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111b21]/70 border border-brand-border/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-brand-emerald block">&lt; ২৫ms</span>
              <span className="text-xs text-gray-400">
                {lang === 'bn' ? 'আল্ট্রা-লো লেটেন্সি' : 'Real-time Latency'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111b21]/70 border border-brand-border/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-white block">WebRTC</span>
              <span className="text-xs text-gray-400">
                {lang === 'bn' ? 'এইচডি অডিও ও ভিডিও' : 'HD Voice & Video'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111b21]/70 border border-brand-border/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-emerald-400 block">Bcrypt</span>
              <span className="text-xs text-gray-400">
                {lang === 'bn' ? 'সুরক্ষিত তথ্য এনক্রিপশন' : 'Secured Encryption'}
              </span>
            </div>
          </div>

          {/* 3. Unique Interactive Live App Mockup (Pure Code, No Flat Image) */}
          <div id="interactive-preview" className="mt-16 w-full max-w-5xl text-left relative">
            {/* Ambient Aura Glow around UI */}
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-emerald/30 via-teal-500/20 to-purple-600/30 rounded-[32px] blur-xl opacity-70" />

            {/* Main Application Mockup Container */}
            <div className="relative rounded-[28px] bg-[#111b21] border border-brand-border/90 shadow-2xl overflow-hidden">
              {/* Window Title Bar */}
              <div className="bg-[#0b141a] px-5 py-3.5 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-3 text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                    Adda Web • {lang === 'bn' ? 'লাইভ সেশন' : 'Live Session'}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 hidden sm:flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#202c33] text-gray-300 font-mono">https://adda.chat/app</span>
                </div>
              </div>

              {/* Window Body: 2-Column Dashboard & Chat Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
                
                {/* Left Mini Sidebar (3 cols) */}
                <div className="hidden md:flex md:col-span-4 bg-[#111b21] border-r border-brand-border p-4 flex-col justify-between">
                  <div className="space-y-2">
                    <div className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'সক্রিয় আড্ডা রুম' : 'Active Rooms'}
                    </div>

                    {/* Room Item 1 - Selected */}
                    <div className="p-3 rounded-2xl bg-[#202c33] border border-brand-emerald/40 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <UserAvatar name="প্রজেক্ট আড্ডা" size="sm" />
                        <div>
                          <h4 className="text-xs font-bold text-white">প্রজেক্ট আড্ডা (টিম)</h4>
                          <p className="text-[11px] text-brand-emerald truncate">তানভীর: ফাইল পাঠানো হয়েছে ✓✓</p>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                    </div>

                    {/* Room Item 2 */}
                    <div className="p-3 rounded-2xl hover:bg-[#182229] border border-transparent flex items-center justify-between cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <UserAvatar name="বন্ধুর আড্ডা" size="sm" />
                        <div>
                          <h4 className="text-xs font-bold text-gray-200">বন্ধুর আড্ডা</h4>
                          <p className="text-[11px] text-gray-400 truncate">আজকের মিটিং কখন?</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full bg-brand-emerald text-brand-dark font-extrabold text-[10px]">
                        ৩
                      </span>
                    </div>

                    {/* Room Item 3 */}
                    <div className="p-3 rounded-2xl hover:bg-[#182229] border border-transparent flex items-center justify-between cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <UserAvatar name="স্টাডি সার্কেল" size="sm" />
                        <div>
                          <h4 className="text-xs font-bold text-gray-200">পড়াশোনা ও রিসোর্স</h4>
                          <p className="text-[11px] text-gray-400 truncate">পিডিএফ নোট শেয়ার করা হলো</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Profile Mini Bar */}
                  <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name="ব্যবহারকারী" size="xs" showOnline={true} isOnline={true} />
                      <div>
                        <span className="text-xs font-bold text-white block">আপনার প্রোফাইল</span>
                        <span className="text-[10px] text-emerald-400 font-medium">অনলাইন</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Chat Stream & Interactive Widgets (8 cols) */}
                <div className="md:col-span-8 bg-[#0b141a] p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Chat Header Bar */}
                  <div className="pb-3 border-b border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name="প্রজেক্ট আড্ডা" size="md" />
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          প্রজেক্ট আড্ডা (টিম)
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                            গ্রুপ
                          </span>
                        </h3>
                        <p className="text-[11px] text-gray-400">
                          {lang === 'bn' ? '৪ জন সক্রিয় সদস্য • লাইভ সেশন চলমান' : '4 active members • Live session in progress'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-xl bg-[#202c33] text-brand-emerald hover:bg-brand-emerald hover:text-brand-dark transition-all flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-xl bg-[#202c33] text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="py-4 space-y-3.5">
                    {/* Message 1 (Incoming) */}
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <UserAvatar name="আরিফ" size="xs" />
                      <div>
                        <span className="text-[11px] font-semibold text-brand-emerald block mb-0.5">আরিফ হাসান</span>
                        <div className="bg-[#202c33] text-white p-3 rounded-2xl rounded-tl-none border border-brand-border/60 text-xs shadow-sm">
                          শুভ সকাল টিম! নতুন ইন্টারফেস ডিজাইনের কাজ সম্পন্ন হয়েছে।
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 block">সকাল ১০:০৫</span>
                      </div>
                    </div>

                    {/* Message 2 (Outgoing Voice Note - Interactive!) */}
                    <div className="flex flex-col items-end max-w-[85%] ml-auto">
                      <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none border border-emerald-500/20 text-xs shadow-sm flex items-center gap-3 w-64">
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="w-8 h-8 rounded-full bg-white text-emerald-800 flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                        >
                          {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 h-5">
                            {[40, 70, 30, 90, 60, 100, 40, 80, 50, 70, 90, 40, 60].map((h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full bg-emerald-200 transition-all ${
                                  isPlayingAudio ? 'animate-pulse' : ''
                                }`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-emerald-100 flex items-center justify-between mt-1">
                            <span>{isPlayingAudio ? 'প্লে হচ্ছে...' : 'ভয়েস নোট (০:২৪)'}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1">সকাল ১০:০৮</span>
                    </div>

                    {/* Floating Interactive Live Call Card */}
                    <div className="bg-[#111b21]/95 border border-brand-emerald/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-brand-emerald flex items-center justify-center animate-pulse">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">লাইভ অডিও সেশন চলছে</h5>
                          <p className="text-[10px] text-gray-400">৩ জন অংশ নিচ্ছেন • ১৪:২০ মিনিট</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          <UserAvatar name="তানভীর" size="xs" />
                          <UserAvatar name="আরিফ" size="xs" />
                          <UserAvatar name="সাকিব" size="xs" />
                        </div>
                        <span className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-brand-dark font-extrabold text-[10px] shadow">
                          যুক্ত হোন
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input Simulated Bar */}
                  <div className="pt-2 border-t border-brand-border flex items-center gap-2">
                    <button className="text-gray-400 hover:text-white p-1.5">
                      <Smile className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-white p-1.5">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'বার্তা লিখুন...' : 'Type a message...'}
                      readOnly
                      value={lang === 'bn' ? 'ধন্যবাদ! আমি এখনই ফাইলটি চেক করছি।' : 'Thanks! Checking the file now.'}
                      className="flex-1 bg-[#202c33] text-white text-xs rounded-xl px-3.5 py-2 border border-brand-border focus:outline-none cursor-default"
                    />
                    <button className="w-8 h-8 rounded-xl bg-brand-emerald text-brand-dark flex items-center justify-center shadow">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Formal Solutions & Capabilities (Bento Grid) */}
      <section id="solutions" className="py-24 bg-[#111b21]/60 border-y border-brand-border/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald mb-2 block">
              {lang === 'bn' ? 'মূল শক্তিমত্তা' : 'Core Architectural Strengths'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {lang === 'bn'
                ? 'আধুনিক যোগাযোগের প্রতিটি ক্ষেত্রে উৎকর্ষতা'
                : 'Engineered for Performance and Enterprise Reliability'}
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Large-Scale Communities (Replaced geeky copy with formal SaaS value) */}
            <div className="md:col-span-2 bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/50 p-8 rounded-3xl transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {lang === 'bn' ? 'বৃহৎ কমিউনিটি ও গ্রুপ যোগাযোগ' : 'High-Scale Group & Community Spaces'}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
                  {lang === 'bn'
                    ? 'ছোট দল থেকে শুরু করে ১০০০+ সদস্যের বৃহৎ কমিউনিটি—সবার জন্য নিরবচ্ছিন্ন যোগাযোগ ব্যবস্থা। একাধিক ব্যক্তি একসাথে সক্রিয় থাকলেও তথ্যের আদান-প্রদান ঘটে তাৎক্ষণিক গতিতে।'
                    : 'Whether for small specialized teams or large communities of 1,000+ members, experience seamless real-time message dispatching with zero congestion.'}
                </p>
              </div>

              {/* Visual indicator bar */}
              <div className="mt-8 pt-6 border-t border-brand-border/60 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  {lang === 'bn' ? 'স্বয়ংক্রিয় লোড ব্যালেন্সিং' : 'Automatic Load Distribution'}
                </span>
                <span className="font-mono text-emerald-400 font-semibold">99.9% Uptime</span>
              </div>
            </div>

            {/* Card 2: Crystal Clear Calling */}
            <div className="bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/50 p-8 rounded-3xl transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {lang === 'bn' ? 'স্বচ্ছ অডিও ও ভিডিও আলাপ' : 'Crystal-Clear Audio & Video'}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'কোনো প্রকার বাফারিং ছাড়াই পিয়ার-টু-পিয়ার স্পষ্ট ভয়েস ও এইচডি ভিডিও কনফারেন্সিং। কম ইন্টারনেট ব্যান্ডউইথেও বজায় থাকে স্থিতিশীলতা।'
                    : 'Low-latency peer-to-peer audio and video streaming engineered to maintain maximum fidelity even under constrained network conditions.'}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-brand-border/60 text-xs text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>{lang === 'bn' ? 'স্ক্রিন শেয়ার ও মিউট নিয়ন্ত্রণ' : 'Screen Share & Audio Controls'}</span>
              </div>
            </div>

            {/* Card 3: Centralized Addabari Workspace */}
            <div className="bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/50 p-8 rounded-3xl transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {lang === 'bn' ? 'আড্ডাবাড়ি — সমন্বিত কর্মক্ষেত্র' : 'Addabari — Centralized Hub'}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার গুরুত্বপূর্ণ বার্তা, পিন করা আড্ডা রুম এবং বুকমার্ক করা ফাইলসমূহ একনজরে দেখার জন্য একটি সুবিন্যস্ত ব্যক্তিগত ড্যাশবোর্ড।'
                    : 'A dedicated workspace consolidating pinned conversations, saved bookmarks, and live unread counts in a single view.'}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-brand-border/60 text-xs text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'ক্যাটাগরি ভিত্তিক ফিল্টারিং' : 'Categorized Room Sorting'}</span>
              </div>
            </div>

            {/* Card 4: Shared Board & Decision Polls */}
            <div className="md:col-span-2 bg-[#111b21] border border-brand-border/80 hover:border-brand-emerald/50 p-8 rounded-3xl transition-all shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {lang === 'bn' ? 'যৌথ পরিকল্পনা ও শেয়ার্ড বোর্ড' : 'Collaborative Shared Boards & Polls'}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
                  {lang === 'bn'
                    ? 'চ্যাট রুমের ভেতরেই নোটিশ পিন করে রাখা, যৌথ কাজের চেকলিস্ট ম্যানেজ করা এবং তাৎক্ষণিক সিদ্ধান্তের জন্য লাইভ পোল তৈরি করার সুবিধা।'
                    : 'Eliminate disjointed tools with in-room announcement boards, collaborative checklist items, and instant live polls with live voting metrics.'}
                </p>
              </div>

              {/* Mini Poll Demo */}
              <div className="mt-6 p-4 rounded-2xl bg-[#202c33] border border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">আজকের মিটিংয়ের সময় নির্ধারণ</span>
                  <span className="text-[11px] text-brand-emerald">৮৭% সদস্য পক্ষে ভোট দিয়েছেন</span>
                </div>
                <button
                  onClick={() => setPollVoted(!pollVoted)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    pollVoted ? 'bg-brand-emerald text-brand-dark' : 'bg-[#111b21] text-white hover:bg-gray-700'
                  }`}
                >
                  {pollVoted ? 'ভোট সম্পন্ন ✓' : 'ভোট দিন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Enterprise Security & Privacy */}
      <section id="enterprise-security" className="py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#111b21] via-[#16242e] to-[#111b21] border border-brand-emerald/40 rounded-3xl p-8 sm:p-14 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/15 text-brand-emerald text-xs font-bold mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ডেটা নিরাপত্তা ও সুরক্ষা' : 'Data Integrity & Privacy'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
                  {lang === 'bn'
                    ? 'আপনার আলাপচারিতার গোপনীয়তা আমাদের সর্বোচ্চ অগ্রাধিকার'
                    : 'Uncompromising Security Built into Every Layer'}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  {lang === 'bn'
                    ? 'Bcrypt ১২-রাউন্ড সল্টেড হ্যাশিংয়ের মাধ্যমে ব্যবহারকারীর পাসওয়ার্ড এনক্রিপ্ট রাখা হয়। সেশন ডিভাইস ম্যানেজমেন্টের মাধ্যমে অননুমোদিত ডিভাইস থেকে তাৎক্ষণিক লগআউটের পূর্ণ নিয়ন্ত্রণ ব্যবহারকারীর হাতে।'
                    : 'Industry-standard Bcrypt cryptographic protection secures identity data. Complete session governance allows instant remote revocation across devices.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <span>{lang === 'bn' ? 'ট্রাস্টেড ডিভাইস ম্যানেজমেন্ট' : 'Trusted Device Governance'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <span>{lang === 'bn' ? 'স্বয়ংক্রিয় নীরব সময় (DND)' : 'Scheduled Quiet Hours'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <span>{lang === 'bn' ? 'নিরাপদ মিডিয়া ও ফাইল স্টোরেজ' : 'Encrypted Attachment Vault'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                    <span>{lang === 'bn' ? 'জিরো ট্র্যাকিং পলিসি' : 'Zero Data Commercialization'}</span>
                  </div>
                </div>
              </div>

              {/* Security Shield Visual Badge */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-56 h-56 rounded-3xl bg-[#0b141a] border-2 border-brand-emerald/50 p-6 flex flex-col items-center justify-center text-center shadow-2xl relative group hover:border-brand-emerald transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mb-3">
                    <Lock className="w-8 h-8" />
                  </div>
                  <span className="text-base font-extrabold text-white">Bcrypt 256-bit</span>
                  <span className="text-xs text-brand-emerald font-semibold mt-1">End-to-End Integrity</span>
                  <span className="text-[10px] text-gray-400 mt-2">Validated Cryptographic Standard</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Mobile & Cross-Device Access */}
      <section id="capabilities" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            {lang === 'bn' ? 'যেকোনো ডিভাইসে তাৎক্ষণিক প্রবেশাধিকার' : 'Seamless Continuity Across All Devices'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {lang === 'bn'
              ? 'মোবাইল ব্রাউজার বা কম্পিউটারের ডেস্কটপ—যেকোনো স্থান থেকেই যুক্ত হওয়া সম্ভব। প্রগ্রেসিভ ওয়েব অ্যাপ প্রযুক্তির মাধ্যমে অ্যাপ স্টোরে না গিয়েও পাওয়া যায় নেটিভ অ্যাপের অনুভূতি।'
              : 'Desktop, tablet, or smartphone. Progressive Web App architecture offers full-screen native performance directly through your browser.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold text-sm shadow-xl shadow-brand-emerald/20 transition-all active:scale-95"
            >
              {lang === 'bn' ? 'এখনই বিনামূল্যে যুক্ত হোন' : 'Join Adda Today'}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-white font-bold text-sm transition-all"
            >
              {t.loginBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Formal Corporate Footer */}
      <footer className="mt-auto border-t border-brand-border/60 bg-[#0b141a] py-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald text-brand-dark font-extrabold text-lg flex items-center justify-center shadow">
              আ
            </div>
            <div>
              <span className="text-gray-200 font-bold block text-sm">Adda (আড্ডা)</span>
              <span className="text-[11px] text-gray-400">{t.brandTagline}</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-gray-400 font-medium">
            <Link href="/login" className="hover:text-brand-emerald transition-colors">
              {t.loginBtn}
            </Link>
            <Link href="/register" className="hover:text-brand-emerald transition-colors">
              {lang === 'bn' ? 'অ্যাকাউন্ট খুলুন' : 'Create Account'}
            </Link>
            <Link href="/chat" className="hover:text-brand-emerald transition-colors">
              {lang === 'bn' ? 'ওয়েব চ্যাট' : 'Web Chat'}
            </Link>
          </div>

          <p className="text-[11px] text-gray-500">
            © {new Date().getFullYear()} Adda Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
