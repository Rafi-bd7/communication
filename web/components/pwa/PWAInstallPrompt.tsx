'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Adda PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#111b21]/95 backdrop-blur-md border border-brand-emerald/40 p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between text-white animate-fade-in">
      <div className="flex items-center gap-3">
        <img 
          src="/icons/icon-192.png" 
          alt="Adda Logo" 
          className="w-10 h-10 rounded-xl object-cover shadow-md border border-brand-emerald/30 flex-shrink-0" 
        />
        <div>
          <h4 className="font-bold text-sm text-white">{t.pwaTitle}</h4>
          <p className="text-[11px] text-gray-400">{t.pwaDesc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="px-3.5 py-1.5 bg-brand-emerald hover:bg-emerald-400 text-brand-dark rounded-xl font-bold text-xs transition-colors shadow-md"
        >
          {t.installBtn}
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 rounded-lg text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
