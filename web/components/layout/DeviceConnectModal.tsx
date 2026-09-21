'use client';

import { useState, useEffect } from 'react';
import { Smartphone, X, Copy, Check, QrCode, Wifi, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceConnectModal({ isOpen, onClose }: DeviceConnectModalProps) {
  const [networkInfo, setNetworkInfo] = useState<{ lan_ip: string; frontend_url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeUrl, setActiveUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getNetworkInfo()
        .then((info) => {
          setNetworkInfo(info);
          setActiveUrl(info.frontend_url || `http://${window.location.hostname}:3000`);
        })
        .catch(() => {
          const host = window.location.hostname;
          const fallback = `http://${host === 'localhost' ? '192.168.0.103' : host}:3000`;
          setActiveUrl(fallback);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (activeUrl) {
      navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrImageUrl = activeUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeUrl)}&bgcolor=111b21&color=00a884`
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-brand-surface border border-brand-emerald/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-card/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Connect Phone / Other Device</h3>
              <p className="text-[11px] text-gray-400">Multi-device real-time communication</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5 overflow-y-auto max-h-[80vh]">
          {/* QR Code Container */}
          <div className="p-3 bg-[#111b21] rounded-2xl border border-brand-emerald/40 shadow-inner flex flex-col items-center">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="QR Code for Mobile Access"
                className="w-44 h-44 rounded-xl object-contain shadow"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-gray-500">
                <QrCode className="w-12 h-12 animate-pulse" />
              </div>
            )}
            <span className="text-[11px] text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Scan with your Phone Camera
            </span>
          </div>

          {/* Direct URL Box */}
          <div className="w-full">
            <label className="text-[11px] text-gray-400 font-medium block mb-1.5 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-brand-emerald" />
              Mobile URL (Same Wi-Fi Network):
            </label>
            <div className="flex items-center gap-2 bg-brand-card border border-brand-border rounded-xl p-2 px-3">
              <input
                type="text"
                readOnly
                value={activeUrl}
                className="bg-transparent text-emerald-400 font-mono text-xs flex-1 outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-brand-emerald/20 hover:bg-brand-emerald/30 text-brand-emerald text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="w-full bg-black/20 border border-brand-border/60 rounded-2xl p-4 text-xs space-y-2.5 text-gray-300">
            <h4 className="font-semibold text-white text-xs mb-1 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-brand-emerald" /> 3 Easy Steps to Test:
            </h4>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
              <p>Connect your phone to the same Wi-Fi as this computer.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
              <p>Scan the QR code above or open the URL in Chrome / Safari.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
              <p>Log in with another user or register a new user on your mobile device.</p>
            </div>
          </div>

          {/* PWA Tip */}
          <div className="w-full bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl p-3 text-[11px] text-emerald-200">
            📲 <strong>Install App on Phone (PWA):</strong> In Chrome tap <em>&quot;Install app&quot;</em> or in Safari tap Share → <em>&quot;Add to Home Screen&quot;</em> to run full-screen like a native app.
          </div>
        </div>
      </div>
    </div>
  );
}
