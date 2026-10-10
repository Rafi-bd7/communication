'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Languages, 
  ArrowRight, 
  Lock, 
  Send, 
  Smile, 
  Paperclip, 
  CheckCheck,
  Mail,
  MapPin,
  Contact,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';

export default function HomePage() {
  const { user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col selection:bg-brand-emerald selection:text-brand-dark overflow-x-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[650px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b141a]/85 border-b border-brand-border/60 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <img 
              src="/logo.png" 
              alt="Adda Logo" 
              className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-brand-emerald/25 border border-brand-emerald/30 group-hover:scale-105 group-hover:shadow-brand-emerald/40 transition-all" 
            />
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
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all shadow-md active:scale-95 ${
                theme === 'dark'
                  ? 'bg-[#111b21] hover:bg-[#202c33] border-brand-border text-amber-300'
                  : 'bg-white hover:bg-slate-100 border-indigo-200 text-indigo-600'
              }`}
              title={theme === 'dark' ? '3D Light Mode' : '3D Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 animate-pulse-glow" /> : <Moon className="w-4 h-4 animate-pulse-glow" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-xs font-bold text-brand-emerald flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 btn-3d-secondary"
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

      {/* 2. Hero Section */}
      <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-12 overflow-hidden">
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

          {/* Main Title */}
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

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
            {lang === 'bn'
              ? 'তাৎক্ষণিক চ্যাট, এইচডি অডিও-ভিডিও কল, স্টোরিজ এবং সোশ্যাল ফিড—সবকিছু এক প্ল্যাটফর্মে।'
              : 'Real-time chat, HD voice & video calling, 24h stories, and social timeline—all in one unified platform.'}
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-emerald via-emerald-400 to-teal-300 text-brand-dark font-extrabold text-sm btn-3d flex items-center justify-center gap-2 group"
            >
              <span>{lang === 'bn' ? 'আড্ডা শুরু করুন' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#111b21] hover:bg-[#202c33] border border-brand-border text-white font-bold text-sm btn-3d-secondary flex items-center justify-center"
            >
              {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </Link>
          </div>

          {/* 3. Live App Mockup with 3D Depth */}
          <div className="mt-14 w-full max-w-4xl text-left relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-emerald/40 via-teal-500/30 to-purple-600/40 rounded-[32px] blur-2xl opacity-75 animate-pulse-glow" />

            <div className="relative rounded-[28px] bg-[#111b21] border border-brand-border/90 card-3d-floating overflow-hidden">
              {/* Window Header */}
              <div className="bg-[#0b141a] px-5 py-3 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
                  <span className="ml-3 text-xs font-semibold text-gray-300 flex items-center gap-2">
                    <img src="/logo.png" alt="Adda" className="w-4 h-4 rounded-md object-cover" />
                    <span>Adda • Live Chat</span>
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-brand-emerald" />
                  <span>Secure & Encrypted</span>
                </div>
              </div>

              {/* Chat Simulation Body */}
              <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-[#111b21] to-[#0c1317]">
                {/* Incoming Message 1 */}
                <div className="flex items-start gap-3 max-w-md">
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow">
                    ত
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#202c33] border border-brand-border/60 text-xs text-gray-200 shadow">
                    <p className="font-bold text-brand-emerald text-[11px] mb-1">তানভীর আহমেদ</p>
                    <p>আজকের আড্ডাটা দারুণ ছিল! কাল বিকেলে ভিডিও কলে সবাই আসছ তো?</p>
                    <span className="text-[10px] text-gray-400 mt-1 block text-right">সন্ধ্যা ৬:৩০</span>
                  </div>
                </div>

                {/* Outgoing Message 2 */}
                <div className="flex items-end justify-end gap-2">
                  <div className="p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs max-w-md shadow-md">
                    <p>হ্যাঁ একদম! আমি সময়মতো জয়েন করব। লিংক পাঠিয়ে রেখো! 🔥</p>
                    <span className="text-[10px] text-emerald-200 mt-1 flex items-center justify-end gap-1">
                      <span>সন্ধ্যা ৬:৩২</span>
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
                    </span>
                  </div>
                </div>

                {/* Voice Message 3 */}
                <div className="flex items-start gap-3 max-w-sm">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow">
                    স
                  </div>
                  <div 
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="p-3 rounded-2xl bg-[#202c33] border border-brand-border/60 text-xs text-gray-200 flex items-center gap-3 cursor-pointer hover:bg-[#28373f] transition-colors shadow"
                  >
                    <button className="w-8 h-8 rounded-full bg-brand-emerald text-brand-dark flex items-center justify-center font-bold shadow text-xs">
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
                    value="Welcome to Adda!"
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

      {/* 4. Contact Info Card (Matching 1st Screenshot) */}
      <section className="py-14 sm:py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center">
          
          {/* Card Container */}
          <div className="w-full max-w-[420px] rounded-[28px] bg-[#101b20]/90 border border-[#203a35] p-7 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-brand-emerald/40 transition-all">
            
            {/* Header with ID Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Contact className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Contact Info
              </h2>
            </div>

            {/* Contact Items */}
            <div className="space-y-4 mb-7 text-sm">
              {/* Email */}
              <a 
                href="mailto:redwanrafi8659@gmail.com" 
                className="flex items-center gap-3.5 text-gray-300 hover:text-white transition-colors group/item"
              >
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                <span className="font-normal truncate">redwanrafi8659@gmail.com</span>
              </a>

              {/* Phone */}
              <a 
                href="tel:+8801940538340" 
                className="flex items-center gap-3.5 text-gray-300 hover:text-white transition-colors group/item"
              >
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                <span className="font-normal">+8801940538340</span>
              </a>

              {/* Location */}
              <div className="flex items-center gap-3.5 text-gray-300">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="font-normal">Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Media Buttons Row */}
            <div className="flex items-center gap-3 pt-1">
              {/* Facebook Button */}
              <a
                href="https://www.facebook.com/share/1F7WSWWFgH/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook Profile"
                className="w-11 h-11 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.704 0-1.008.08-1.249.25-.33.23-.472.632-.472 1.328v2.408h4.52l-.462 3.667h-4.058v7.98H9.1z"/>
                </svg>
              </a>

              {/* Instagram Button */}
              <a
                href="https://www.instagram.com/_cool_red_wine_?mdxt=OXEzYzV1NWtzOGM3"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram Profile"
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-lg shadow-pink-500/25 hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>

              {/* LinkedIn Button */}
              <a
                href="https://www.linkedin.com/in/red-rafi?"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="LinkedIn Profile"
                className="w-11 h-11 rounded-full bg-[#0077b5] hover:bg-[#00669c] text-white flex items-center justify-center shadow-lg shadow-blue-600/25 hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
              </a>

              {/* GitHub Button */}
              <a
                href="https://github.com/Rafi-bd7"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                aria-label="GitHub Profile"
                className="w-11 h-11 rounded-full bg-[#24292e] hover:bg-[#1b1f23] border border-white/10 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>

          </div>

          {/* Footer Matching Screenshot 1 */}
          <div className="w-full border-t border-white/5 mt-16 pt-8 flex flex-col items-center gap-2.5 text-center">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Adda Logo" className="w-6 h-6 rounded-lg object-cover shadow-sm border border-brand-emerald/30" />
              <span className="text-sm font-bold text-gray-300 tracking-tight">Adda</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-normal">
              © {new Date().getFullYear()} Adda by RAFI. Designed for Everyone.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
