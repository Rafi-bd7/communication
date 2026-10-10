'use client';

import { 
  Home,
  MessageSquare, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Smartphone,
  Languages,
  UserPlus,
  Globe,
  Phone,
  Sun,
  Moon,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';
import UserAvatar from '@/components/common/UserAvatar';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  openDeviceConnect: () => void;
  openDiscoverPeople?: () => void;
  openTimeline?: () => void;
  openMyProfile?: () => void;
}

export function AppSidebar({ 
  activeTab, 
  setActiveTab, 
  openSettings, 
  openDeviceConnect,
  openDiscoverPeople,
  openTimeline,
  openMyProfile
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', label: lang === 'bn' ? 'হোম হাব ও ফিড' : 'Home Hub', icon: Home },
    { id: 'chats', label: lang === 'bn' ? 'চ্যাট ও মেসেজ' : 'Chats & Messages', icon: MessageSquare },
    { id: 'calls', label: lang === 'bn' ? 'কল হিস্ট্রি' : 'Calls', icon: Phone },
    { id: 'status', label: lang === 'bn' ? 'স্টোরিজ' : 'Stories', icon: ImageIcon },
  ];

  return (
    <aside className="w-16 md:w-20 h-full bg-[#111b21] border-r border-brand-border flex flex-col items-center justify-between py-5 select-none z-20 shadow-2xl">
      {/* Top Brand & Navigation */}
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Brand Logo with 3D Pop */}
        <div 
          onClick={() => setActiveTab('chats')} 
          className="group relative w-12 h-12 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all card-3d p-0.5"
          title="Adda — স্মার্ট আলাপ, যেকোনো জায়গায়।"
        >
          <img
            src="/logo.png"
            alt="Adda Logo"
            className="w-full h-full rounded-2xl object-cover shadow-lg shadow-brand-emerald/30 border border-brand-emerald/40 group-hover:shadow-brand-emerald/50 transition-all"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-dark rounded-full flex items-center justify-center border border-brand-border">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400" />
          </span>
        </div>

        {/* Language Switcher 3D Pill */}
        <button
          onClick={toggleLanguage}
          title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          className="px-2.5 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-brand-border/80 text-[11px] font-extrabold text-brand-emerald flex items-center gap-1.5 transition-all shadow-md btn-3d-secondary hover:scale-105"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
        </button>

        {/* Navigation Icons with 3D Depth */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'feed' && activeTab === 'feed');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-tr from-brand-emerald/25 to-teal-500/20 text-brand-emerald border border-brand-emerald/50 shadow-lg shadow-brand-emerald/20 translate-y-[-1px]'
                    : 'text-gray-400 hover:text-white hover:bg-[#202c33] border border-transparent hover:border-brand-border/40 hover:shadow-md'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-emerald rounded-r-full shadow-md shadow-brand-emerald" />
                )}
              </button>
            );
          })}

          {/* Discover People & Add Friends (3D Glow) */}
          {openDiscoverPeople && (
            <button
              onClick={openDiscoverPeople}
              title={lang === 'bn' ? '👥 মানুষ খুঁজুন ও ফ্রেন্ড রিকোয়েস্ট পাঠান' : '👥 Discover People'}
              className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 shadow-md shadow-sky-500/10 transition-all duration-200 group active:scale-95"
            >
              <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shadow-sm shadow-sky-400" />
            </button>
          )}

          {/* Admin Panel (If User is Admin) */}
          {user?.is_admin && (
            <button
              onClick={() => setActiveTab('admin')}
              title={t.navAdmin}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md'
                  : 'text-amber-500/70 hover:text-amber-400 hover:bg-[#202c33]'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* 3D Day / Night Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? (lang === 'bn' ? 'লাইট/ডে মোডে পরিবর্তন করুন' : 'Switch to Light Mode') : (lang === 'bn' ? 'ডার্ক/নাইট মোডে পরিবর্তন করুন' : 'Switch to Dark Mode')}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 border ${
            theme === 'dark'
              ? 'bg-[#202c33] text-amber-300 border-amber-400/30 hover:bg-amber-400/15 shadow-amber-500/10'
              : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-indigo-500/15'
          }`}
        >
          {theme === 'dark' 
            ? <Sun className="w-5 h-5 animate-pulse-glow" />
            : <Moon className="w-5 h-5 animate-pulse-glow" />
          }
        </button>

        {/* Connect Phone / Mobile Access */}
        <button
          onClick={openDeviceConnect}
          title={t.navDeviceConnect}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-emerald bg-brand-emerald/10 hover:bg-brand-emerald/20 border border-brand-emerald/30 shadow-sm transition-all relative group"
        >
          <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={openSettings}
          title={t.navSettings}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#202c33] border border-transparent hover:border-brand-border/60 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={logout}
          title={t.navLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <div className="pt-2 border-t border-brand-border w-full flex justify-center">
          <div 
            onClick={openMyProfile || openSettings}
            className="relative cursor-pointer group hover:scale-105 transition-transform"
            title={`${user?.full_name} (@${user?.username})`}
          >
            <UserAvatar
              name={user?.full_name || user?.username}
              avatarUrl={user?.avatar_url}
              size="md"
              showOnline={true}
              isOnline={true}
              className="ring-2 ring-brand-emerald/70 avatar-3d shadow-lg"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
