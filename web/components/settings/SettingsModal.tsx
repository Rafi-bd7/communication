'use client';

import { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Phone, 
  FileText, 
  Check, 
  Save, 
  ShieldCheck, 
  Smartphone, 
  Moon, 
  Sun,
  BellOff, 
  Globe, 
  LogOut,
  Laptop,
  Camera,
  Upload,
  Palette,
  Trash2,
  AlertTriangle,
  MapPin,
  GraduationCap,
  Briefcase,
  Cake
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser, logout } = useAuth();
  const { t, lang, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url || '');

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'language' | 'privacy' | 'devices' | 'quiet'>('profile');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
  const [livesIn, setLivesIn] = useState(user?.lives_in || '');
  const [education, setEducation] = useState(user?.education || '');
  const [workplace, setWorkplace] = useState(user?.workplace || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmPrompt = lang === 'bn'
      ? '⚠️ আপনি কি নিশ্চিত যে আপনি আপনার আইডি সম্পূর্ণভাবে ডিলিট করতে চান?\n\nডিলিট করলে আপনার প্রোফাইল, সমস্ত বার্তা, কল এবং পোস্ট চিরতরে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব হবে না!'
      : '⚠️ Are you sure you want to permanently delete your account?\n\nAll your messages, posts, calls, and profile data will be permanently wiped. This action CANNOT be undone!';

    if (!window.confirm(confirmPrompt)) return;

    setIsDeleting(true);
    try {
      await api.deleteMyAccount();
      alert(lang === 'bn' ? 'আপনার আইডি সফলভাবে মুছে ফেলা হয়েছে।' : 'Your account has been deleted successfully.');
      onClose();
      logout();
      window.location.href = '/register';
    } catch (err: any) {
      alert(err.message || (lang === 'bn' ? 'আইডি মুছতে ব্যর্থ হয়েছে।' : 'Failed to delete account.'));
      setIsDeleting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const uploadRes = await api.uploadFile(file);
      const newAvatarUrl = uploadRes.url || uploadRes.file_url;
      setCurrentAvatar(newAvatarUrl);

      const updated = await api.updateProfile({
        avatar_url: newAvatarUrl,
        full_name: fullName,
        bio: bio,
        phone: phone || undefined,
      });
      updateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Privacy Snapshot state
  const [profileVisibility, setProfileVisibility] = useState('everyone');
  const [lastSeenVisibility, setLastSeenVisibility] = useState('contacts');

  // Quiet Hours state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('23:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        bio: bio,
        phone: phone || undefined,
        date_of_birth: dateOfBirth || undefined,
        lives_in: livesIn || undefined,
        education: education || undefined,
        workplace: workplace || undefined,
      });
      updateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-brand-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-[#182229]">
          <h3 className="font-bold text-sm text-white">{t.settingsTitle}</h3>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#182229]/60 border-b border-brand-border overflow-x-auto">
          {[
            { id: 'profile', label: lang === 'bn' ? 'প্রোফাইল' : 'Profile', icon: User },
            { id: 'language', label: lang === 'bn' ? 'ভাষা ও থিম (Language & Theme)' : 'Language & Theme (ভাষা ও থিম)', icon: Globe },
            { id: 'privacy', label: lang === 'bn' ? 'প্রাইভেসি স্ন্যাপশট' : 'Privacy Snapshot', icon: ShieldCheck },
            { id: 'devices', label: lang === 'bn' ? 'বিশ্বস্ত ডিভাইস' : 'Trusted Devices', icon: Smartphone },
            { id: 'quiet', label: lang === 'bn' ? 'নীরব সময়' : 'Quiet Hours', icon: Moon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-emerald text-brand-dark font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#202c33]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex flex-col items-center gap-3 border-b border-brand-border bg-[#0b141a]/40">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
                title={lang === 'bn' ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload photo'}
              >
                {currentAvatar && !currentAvatar.includes('dicebear') ? (
                  <img
                    src={currentAvatar}
                    alt={user?.full_name}
                    className="w-24 h-24 rounded-full border-4 border-brand-emerald object-cover shadow-xl bg-[#202c33]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-brand-emerald bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl">
                    {(fullName || user?.username || 'A').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <Camera className="w-6 h-6 text-brand-emerald" />
                  <span className="text-[10px] font-bold mt-1">{lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change'}</span>
                </div>

                {/* Uploading Spinner */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/75 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
                  </div>
                )}

                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#111b21] flex items-center justify-center shadow">
                  <Camera className="w-3.5 h-3.5 text-brand-dark" />
                </span>
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-xs text-brand-emerald font-bold hover:underline flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডিভাইস থেকে নিজের ছবি আপলোড করুন' : 'Upload your photo'}</span>
              </button>

              <div className="text-center">
                <h4 className="font-bold text-base text-white">{fullName || user?.full_name}</h4>
                <p className="text-xs text-brand-emerald">@{user?.username}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1.5">{lang === 'bn' ? 'পুরো নাম' : 'Full Name'}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1.5">{lang === 'bn' ? 'বায়ো / স্ট্যাটাস' : 'About / Bio'}</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1.5">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1..."
                  className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-medium block mb-1.5 flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5 text-pink-400" />
                    <span>{lang === 'bn' ? 'জন্ম তারিখ (Date of Birth)' : 'Date of Birth'}</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-medium block mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? 'কোথায় থাকেন (Lives in)' : 'Lives in'}</span>
                  </label>
                  <input
                    type="text"
                    value={livesIn}
                    onChange={(e) => setLivesIn(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: ঢাকা, বাংলাদেশ' : 'e.g. Dhaka, Bangladesh'}
                    className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-medium block mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'কোথায় পড়েন (Education)' : 'Education / Studies at'}</span>
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder={lang === 'bn' ? 'স্কুল/কলেজ/বিশ্ববিদ্যালয়...' : 'School, College or University...'}
                    className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-medium block mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'কোথায় চাকরি করেন (Workplace)' : 'Workplace / Job'}</span>
                  </label>
                  <input
                    type="text"
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    placeholder={lang === 'bn' ? 'কোম্পানি বা পেশা...' : 'Company or Occupation...'}
                    className="w-full bg-[#202c33] text-white rounded-xl px-3.5 py-2.5 border border-brand-border focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {lang === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস: সক্রিয়' : 'Status: Active'}
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-400 text-brand-dark font-bold flex items-center gap-1.5 shadow-md shadow-brand-emerald/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {savedSuccess ? (lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!') : isSaving ? t.loading : t.save}
                </button>
              </div>
            </form>

            {/* Account Deletion / Danger Zone */}
            <div className="p-5 border-t border-brand-border/60 bg-red-500/5">
              <div className="p-4 rounded-2xl bg-[#1a1215] border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-xs text-red-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলুন' : 'Delete Account'}</span>
                  </h5>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {lang === 'bn' ? 'আপনার আইডি ও সমস্ত তথ্য চিরতরে ডিলিট করতে চান?' : 'Permanently remove your account and all data'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 flex-shrink-0 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? (lang === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (lang === 'bn' ? 'আইডি ডিলিট করুন' : 'Delete Account')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Language & Theme (Day/Night Mode & Language Settings) */}
        {activeTab === 'language' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs">
            {/* Theme Section */}
            <div>
              <div className="bg-[#182229] border border-brand-border rounded-2xl p-4 mb-3">
                <h4 className="font-bold text-sm text-brand-emerald mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand-emerald" />
                  <span>{lang === 'bn' ? 'থিম নির্বাচন (Day / Night Mode)' : 'Display Theme (Day / Night)'}</span>
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {lang === 'bn' 
                    ? 'আপনার পছন্দের ডিসপ্লে মোড নির্বাচন করুন। রাতের চোখের সুরক্ষায় নাইট মোড অথবা দিনের কাজের জন্য ডে মোড বেছে নিন।' 
                    : 'Choose between Day (Light) or Night (Dark) mode for your preference.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer card-3d ${
                    theme === 'dark'
                      ? 'border-brand-emerald bg-brand-emerald/15 text-white ring-2 ring-brand-emerald/40 shadow-xl scale-[1.02]'
                      : 'border-brand-border bg-[#202c33] text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-brand-emerald/20 text-brand-emerald shadow-inner' : 'bg-gray-800 text-gray-400'}`}>
                    <Moon className="w-5 h-5 animate-pulse-glow" />
                  </div>
                  <div className="text-center">
                    <span className="font-extrabold text-xs block">{lang === 'bn' ? '3D ডার্ক মোড' : '3D Dark Cyber'}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{lang === 'bn' ? 'অবসিডিয়ান 3D গ্লাস ও নিয়ন' : 'Obsidian Cyber Depth'}</span>
                  </div>
                  {theme === 'dark' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-brand-emerald font-bold bg-brand-emerald/10 px-2 py-0.5 rounded-full border border-brand-emerald/30">
                      <Check className="w-3 h-3" /> {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer card-3d ${
                    theme === 'light'
                      ? 'border-brand-emerald bg-brand-emerald/15 text-white ring-2 ring-brand-emerald/40 shadow-xl scale-[1.02]'
                      : 'border-brand-border bg-[#202c33] text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-amber-400/20 text-amber-400 shadow-inner' : 'bg-gray-800 text-gray-400'}`}>
                    <Sun className="w-5 h-5 animate-pulse-glow" />
                  </div>
                  <div className="text-center">
                    <span className="font-extrabold text-xs block">{lang === 'bn' ? '3D লাইট মোড' : '3D Light Ceramic'}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{lang === 'bn' ? 'নিউমর্ফিক 3D সিরামিক' : 'Neumorphic Tactile'}</span>
                  </div>
                  {theme === 'light' && (
                    <span className="inline-flex items-center gap-1 text-brand-emerald font-bold text-[10px] bg-brand-emerald/10 px-2 py-0.5 rounded-full border border-brand-emerald/30">
                      <Check className="w-3 h-3" /> {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <div className="bg-[#182229] border border-brand-border rounded-2xl p-4 mb-3">
                <h4 className="font-bold text-sm text-brand-emerald mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-emerald" />
                  <span>{lang === 'bn' ? 'ভাষা নির্বাচন (Language Selection)' : 'Language Selection'}</span>
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার সুবিধার জন্য ভাষা নির্বাচন করুন। আপনি চাইলে যেকোনো সময় সম্পূর্ণ অ্যাপ বাংলায় বা ইংরেজিতে পরিবর্তন করতে পারেন।'
                    : 'Select your preferred language. You can switch between Bengali and English anytime.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all text-center ${
                    lang === 'bn'
                      ? 'border-brand-emerald bg-brand-emerald/15 text-white ring-2 ring-brand-emerald/50 shadow-lg'
                      : 'border-brand-border bg-[#202c33] text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">🇧🇩</span>
                  <div>
                    <h5 className="font-bold text-xs text-white">বাংলা</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">বাংলা ভাষা</p>
                  </div>
                  {lang === 'bn' ? (
                    <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-brand-dark text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> সক্রিয়
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">নির্বাচন করুন</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all text-center ${
                    lang === 'en'
                      ? 'border-brand-emerald bg-brand-emerald/15 text-white ring-2 ring-brand-emerald/50 shadow-lg'
                      : 'border-brand-border bg-[#202c33] text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <h5 className="font-bold text-xs text-white">English</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">English Language</p>
                  </div>
                  {lang === 'en' ? (
                    <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-brand-dark text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">Select</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Privacy Snapshot */}
        {activeTab === 'privacy' && (
          <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto text-xs">
            <div className="bg-[#182229] border border-brand-border rounded-2xl p-4">
              <h4 className="font-bold text-sm text-brand-emerald mb-1">{t.privacySnapshotTitle}</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">{t.privacyDesc}</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-300 font-semibold">{lang === 'bn' ? 'প্রোফাইল ছবি কে দেখতে পারবে?' : 'Who can see your profile photo?'}</label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="bg-[#202c33] border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-emerald"
                >
                  <option value="everyone">{lang === 'bn' ? 'সবাই (Everyone)' : 'Everyone'}</option>
                  <option value="contacts">{lang === 'bn' ? 'শুধু পরিচিতরা (Contacts only)' : 'Contacts only'}</option>
                  <option value="nobody">{lang === 'bn' ? 'কেউ না (Nobody)' : 'Nobody'}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-300 font-semibold">{lang === 'bn' ? 'সর্বশেষ সক্রিয়তার সময় (Last Seen)' : 'Last seen & Online status'}</label>
                <select
                  value={lastSeenVisibility}
                  onChange={(e) => setLastSeenVisibility(e.target.value)}
                  className="bg-[#202c33] border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-emerald"
                >
                  <option value="everyone">{lang === 'bn' ? 'সবাই (Everyone)' : 'Everyone'}</option>
                  <option value="contacts">{lang === 'bn' ? 'শুধু পরিচিতরা (Contacts only)' : 'Contacts only'}</option>
                  <option value="nobody">{lang === 'bn' ? 'কেউ না (Nobody)' : 'Nobody'}</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 text-[11px] text-gray-300 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" />
                <p>
                  {lang === 'bn'
                    ? 'আড্ডা আপনার গোপনীয়তাকে সর্বোচ্চ অগ্রাধিকার দেয়। আপনার ডেটা সুরক্ষিত ও এনক্রিপ্ট করা।'
                    : 'Adda prioritizes your privacy. Your communications and personal data are strictly secured.'}
                </p>
              </div>

              {/* Account Deletion Option */}
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2 mt-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <Trash2 className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অ্যাকাউন্ট স্থায়ীভাবে ডিলিট করুন' : 'Permanently Delete Account'}</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনি যদি আর এই আইডি চালাতে না চান, তবে এখান থেকে সরাসরি অ্যাকাউন্ট ডিলিট করতে পারেন। এতে আপনার প্রোফাইল ও সমস্ত তথ্য চিরতরে মুছে যাবে।'
                    : 'If you no longer wish to keep your account, you can permanently delete it here.'}
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all mt-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? (lang === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (lang === 'bn' ? 'আমার আইডি ডিলিট করুন' : 'Delete My Account')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Trusted Devices */}
        {activeTab === 'devices' && (
          <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto text-xs">
            <div>
              <h4 className="font-bold text-sm text-white mb-1">{t.trustedDevicesTitle}</h4>
              <p className="text-gray-400 text-[11px]">{lang === 'bn' ? 'বর্তমানে যেসকল ডিভাইসে আপনার আড্ডা অ্যাকাউন্ট লগইন করা আছে' : 'Devices where your Adda account is currently active'}</p>
            </div>

            {/* Current Device */}
            <div className="bg-[#182229] border border-brand-emerald/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 text-brand-emerald flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-xs">{t.currentDevice}</h5>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px]">
                      {t.online}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Windows • Chrome • 127.0.0.1</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(lang === 'bn' ? 'অন্যান্য ডিভাইস সফলভাবে লগআউট করা হয়েছে।' : 'Logged out other devices.')}
              className="mt-2 py-2.5 px-4 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logoutOtherDevices}</span>
            </button>
          </div>
        )}

        {/* Tab 4: Quiet Hours */}
        {activeTab === 'quiet' && (
          <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto text-xs">
            <div className="bg-[#182229] border border-brand-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span>{t.quietHoursTitle}</span>
                </h4>
                <input
                  type="checkbox"
                  checked={quietHoursEnabled}
                  onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                  className="accent-brand-emerald w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">{t.quietHoursDesc}</p>
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1.5">
                    {lang === 'bn' ? 'শুরুর সময়' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full bg-[#202c33] border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-emerald"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1.5">
                    {lang === 'bn' ? 'শেষের সময়' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full bg-[#202c33] border border-brand-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
