import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'Adda — স্মার্ট আলাপ, যেকোনো জায়গায়।',
  description: 'আধুনিক, নিরাপদ ও বাংলা-ফার্স্ট যোগাযোগ প্ল্যাটফর্ম। রিয়েলটাইম চ্যাট, অডিও/ভিডিও কল, আড্ডাবাড়ি ও স্টোরি।',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#00a884',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#0b141a] text-[#e9edef] antialiased selection:bg-brand-emerald selection:text-brand-dark">
        <AuthProvider>
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
