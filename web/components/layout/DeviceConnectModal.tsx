'use client';

import { useState, useEffect } from 'react';
import { Smartphone, X, Copy, Check, QrCode, Wifi, Globe, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceConnectModal({ isOpen, onClose }: DeviceConnectModalProps) {
  const { lang } = useLanguage();
  const [networkInfo, setNetworkInfo] = useState<{ lan_ip: string; frontend_url: string; public_url?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<'public' | 'lan'>('public');
  const [isLoading, setIsLoading] = useState(true);

  const loadNetworkInfo = () => {
    setIsLoading(true);
    api.getNetworkInfo()
      .then((info) => {
        setNetworkInfo(info);
        // Default to public mode if public_url exists, else LAN
        if (!info.public_url) setActiveMode('lan');
      })
      .catch(() => {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        setNetworkInfo({
          lan_ip: host,
          frontend_url: `http://${host}:3000`,
          public_url: undefined,
        });
        setActiveMode('lan');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadNetworkInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeUrl = activeMode === 'public' && networkInfo?.public_url
    ? networkInfo.public_url
    : (networkInfo?.frontend_url || (typeof window !== 'undefined' ? window.location.origin : ''));

  const handleCopy = (url: string) => {
    if (url) {
      navigator.clipboard.writeText(url + '/register');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const qrImageUrl = activeUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeUrl)}&bgcolor=111b21&color=00a884&margin=10`
    : '';

  const hasPublic = !!networkInfo?.public_url;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-emerald/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in text-white flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-[#152028]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-emerald to-teal-400 text-brand-dark flex items-center justify-center shadow-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {lang === 'bn' ? 'যেকোনো ডিভাইস থেকে অ্যাক্সেস' : 'Access from Any Device'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {lang === 'bn' ? 'QR স্ক্যান করে লিংক শেয়ার করুন' : 'Scan QR or share the link'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadNetworkInfo}
              title="Refresh"
              className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[82vh]">
          
          {/* Mode Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('public')}
              disabled={!hasPublic}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'public'
                  ? 'bg-brand-emerald text-brand-dark shadow-md'
                  : hasPublic
                    ? 'bg-[#202c33] text-gray-300 hover:text-white'
                    : 'bg-[#1a2429] text-gray-600 cursor-not-allowed'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ইন্টারনেট (সারা বিশ্ব)' : 'Internet (Worldwide)'}</span>
            </button>
            <button
              onClick={() => setActiveMode('lan')}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'lan'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-[#202c33] text-gray-300 hover:text-white'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লোকাল নেটওয়ার্ক' : 'Local Network'}</span>
            </button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              {isLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
                </div>
              ) : qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-48 h-48 rounded-xl object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                  <QrCode className="w-16 h-16 animate-pulse" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
              <span className="text-xs font-semibold text-brand-emerald">
                {lang === 'bn' ? 'ক্যামেরা দিয়ে স্ক্যান করুন' : 'Scan with your Camera / QR App'}
              </span>
            </div>
          </div>

          {/* Active URL Box */}
          <div className="space-y-2">
            <label className="text-[11px] text-gray-400 font-semibold flex items-center gap-1.5">
              {activeMode === 'public' ? <Globe className="w-3.5 h-3.5 text-brand-emerald" /> : <Wifi className="w-3.5 h-3.5 text-sky-400" />}
              {activeMode === 'public'
                ? (lang === 'bn' ? 'পাবলিক লিংক (যেকোনো জায়গা থেকে):' : 'Public Link (Anywhere in the world):')
                : (lang === 'bn' ? 'লোকাল নেটওয়ার্ক লিংক (একই Wi-Fi):' : 'Local Network URL (Same Wi-Fi only):')}
            </label>
            <div className="flex items-center gap-2 bg-[#0b141a] border border-brand-border rounded-2xl p-3">
              <input
                type="text"
                readOnly
                value={isLoading ? 'Loading...' : activeUrl}
                className="bg-transparent text-brand-emerald font-mono text-xs flex-1 outline-none select-all min-w-0"
              />
              <button
                onClick={() => handleCopy(activeUrl)}
                className="flex items-center gap-1.5 bg-brand-emerald hover:bg-brand-emerald/80 text-brand-dark text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors flex-shrink-0 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'bn' ? 'কপি!' : 'Copied!') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
            {activeMode === 'public' && activeUrl && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-brand-emerald hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ব্রাউজারে খুলুন' : 'Open in browser'}</span>
              </a>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-[#0b141a] border border-brand-border/60 rounded-2xl p-4 text-xs space-y-2.5 text-gray-300">
            {activeMode === 'public' ? (
              <>
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-brand-emerald" />
                  {lang === 'bn' ? 'ইন্টারনেট অ্যাক্সেস — যা করবেন:' : 'Internet Access — How to use:'}
                </h4>
                {[
                  lang === 'bn' ? 'যেকোনো ডিভাইস থেকে QR কোড স্ক্যান করুন বা লিংকটি শেয়ার করুন।' : 'Scan the QR code or share the link with anyone, anywhere.',
                  lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন বা বিদ্যমান অ্যাকাউন্ট দিয়ে লগইন করুন।' : 'Register a new account or log in with your existing credentials.',
                  lang === 'bn' ? 'বন্ধু যোগ করুন এবং রিয়েল-টাইমে চ্যাট করুন!' : 'Add friends and start real-time chatting!',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </>
            ) : (
              <>
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                  {lang === 'bn' ? 'লোকাল নেটওয়ার্ক — যা করবেন:' : 'Local Network — How to use:'}
                </h4>
                {[
                  lang === 'bn' ? 'আপনার ফোনটি এই কম্পিউটারের একই Wi-Fi নেটওয়ার্কে যুক্ত করুন।' : 'Connect your phone to the same Wi-Fi as this computer.',
                  lang === 'bn' ? 'QR কোড স্ক্যান করুন অথবা Chrome / Safari এ URL টি খুলুন।' : 'Scan the QR code or open the URL in Chrome / Safari.',
                  lang === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন বা লগইন করুন।' : 'Create a new account or sign in with your existing account.',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* PWA Install Tip */}
          <div className="bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl p-3 text-[11px] text-emerald-200 leading-relaxed">
            📲 <strong>{lang === 'bn' ? 'মোবাইল অ্যাপ হিসেবে ইনস্টল করুন:' : 'Install as Mobile App (PWA):'}</strong>{' '}
            {lang === 'bn'
              ? 'Chrome-এ "Install app" চাপুন অথবা Safari-তে Share → "Add to Home Screen" করুন।'
              : 'In Chrome tap "Install app" or in Safari: Share → "Add to Home Screen" for full-screen native experience.'}
          </div>
        </div>
      </div>
    </div>
  );
}
