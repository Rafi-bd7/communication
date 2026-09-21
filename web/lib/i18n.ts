'use client';

import { useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    // Brand
    brandName: 'আড্ডা',
    brandTagline: 'স্মার্ট আলাপ, যেকোনো জায়গায়।',
    brandSubtitle: 'আধুনিক, নিরাপদ ও বাংলা-ফার্স্ট যোগাযোগ প্ল্যাটফর্ম',

    // Navigation
    navChats: 'আড্ডা',
    navAddabari: 'আড্ডাবাড়ি',
    navStories: 'মুহূর্ত',
    navCalls: 'কল',
    navAdmin: 'অ্যাডমিন',
    navSettings: 'সেটিংস',
    navDeviceConnect: 'ডিভাইস লিংক',
    navAI: 'আড্ডা সহকারী',
    navLogout: 'লগআউট',

    // Common
    searchPlaceholder: 'আড্ডা বা বার্তা খুঁজুন...',
    online: 'অনলাইন',
    offline: 'অফলাইন',
    activeNow: 'এখন সক্রিয়',
    typing: 'টাইপ করছেন...',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',
    back: 'ফিরে যান',
    loading: 'লোড হচ্ছে...',
    send: 'পাঠান',
    copy: 'কপি',
    reply: 'রিপ্লাই',
    edit: 'এডিট',
    delete: 'ডিলিট',
    pin: 'পিন করুন',
    bookmark: 'সংগ্রহে রাখুন',
    bookmarked: 'সংগ্রহে যুক্ত হয়েছে',
    share: 'শেয়ার করুন',

    // Message Status
    sending: 'পাঠানো হচ্ছে',
    sent: 'পাঠানো হয়েছে',
    delivered: 'পৌঁছেছে',
    seen: 'দেখা হয়েছে',

    // Topics
    all: 'সব',
    topicStudy: 'পড়াশোনা',
    topicFriends: 'বন্ধু-আড্ডা',
    topicWork: 'কাজ',
    topicProject: 'প্রজেক্ট',
    addTopic: 'টপিক নির্বাচন',

    // Addabari
    addabariTitle: 'আড্ডাবাড়ি',
    addabariSubtitle: 'আপনার ব্যক্তিগত আড্ডার কেন্দ্রবিন্দু',
    quickStats: 'আজকের পরিসংখ্যান',
    totalChats: 'মোট আড্ডা',
    unreadMessages: 'অপঠিত বার্তা',
    activeRooms: 'সক্রিয় রুম',
    pinnedRooms: 'পিন করা আড্ডা',
    quickAddaBtn: 'ঝটপট আড্ডা শুরু করুন',
    recentActivity: 'সাম্প্রতিক কার্যকলাপ',
    savedMessagesPreview: 'সংরক্ষিত বার্তা',
    noPinnedRooms: 'এখনো কোনো আড্ডা পিন করা হয়নি',

    // Quick Adda
    quickAddaTitle: 'ঝটপট আড্ডা',
    quickAddaSubtitle: 'মুহূর্তেই নতুন গ্রুপ রুম তৈরি করে বন্ধুদের আমন্ত্রণ জানান',
    roomName: 'রুমের নাম',
    roomNamePlaceholder: 'যেমন: উইকেন্ড প্ল্যানিং বা চায়ের আড্ডা...',
    selectTopic: 'টপিক বা ক্যাটাগরি',
    createRoomBtn: 'রুম তৈরি করুন',
    roomCode: 'রুম কোড',
    copyInviteLink: 'আমন্ত্রণ লিংক কপি করুন',

    // Shared Board
    sharedBoardTitle: 'শেয়ার্ড বোর্ড',
    sharedBoardSubtitle: 'রুমের গুরুত্বপূর্ণ নোটিশ, চেকলিস্ট ও তথ্য',
    pinnedNotices: 'পিন করা নোটিশ',
    roomChecklist: 'কাজের তালিকা / চেকলিস্ট',
    addChecklistItem: 'নতুন কাজ লিখুন...',
    sharedPoll: 'দ্রুত পোল',

    // Collections
    collectionsTitle: 'সংগ্রহসমূহ',
    collectionsSubtitle: 'আপনার সংরক্ষিত গুরুত্বপূর্ণ বার্তা ও লিংক',
    allCollections: 'সব বার্তা',
    importantTab: 'জরুরি',
    mediaTab: 'ছবি ও ফাইল',
    linksTab: 'লিংকসমূহ',
    noSavedMessages: 'কোনো বার্তা সংরক্ষিত নেই। বার্তার পাশের বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।',

    // Settings & Privacy
    settingsTitle: 'প্রোফাইল ও সেটিংস',
    privacySnapshotTitle: 'প্রাইভেসি স্ন্যাপশট',
    privacyDesc: 'কে কে আপনার প্রোফাইল ও স্টোরি দেখতে পাবে তা নিয়ন্ত্রণ করুন',
    trustedDevicesTitle: 'বিশ্বস্ত ডিভাইসসমূহ',
    currentDevice: 'বর্তমান ডিভাইস (এই ব্রাউজার)',
    quietHoursTitle: 'নীরব সময় (Quiet Hours)',
    quietHoursDesc: 'নির্ধারিত সময়ে নোটিফিকেশন ও সাউন্ড স্বয়ংক্রিয়ভাবে বন্ধ রাখুন',
    activeSessions: 'সক্রিয় সেশনসমূহ',
    logoutOtherDevices: 'অন্যান্য সব ডিভাইস থেকে লগআউট করুন',

    // Auth
    loginTitle: 'আড্ডায় স্বাগতম',
    loginSubtitle: 'আপনার অ্যাকাউন্টে প্রবেশ করে চ্যাট শুরু করুন',
    usernameOrEmail: 'ইউজারনেম অথবা ইমেইল',
    password: 'পাসওয়ার্ড',
    loginBtn: 'লগইন করুন',
    quickDemoAccounts: 'এক ক্লিকে ডেমো লগইন:',
    demoAlice: 'Alice (ডিজাইনার)',
    demoBob: 'Bob (ইঞ্জিনিয়ার)',
    demoAdmin: 'অ্যাডমিন',

    // PWA
    pwaTitle: 'Adda অ্যাপ ইনস্টল করুন',
    pwaDesc: 'মোবাইল বা পিসিতে এক ক্লিকে ইনস্টল করে ব্যবহার করুন',
    installBtn: 'ইনস্টল',
  },
  en: {
    // Brand
    brandName: 'Adda',
    brandTagline: 'Smart Conversation, Anywhere.',
    brandSubtitle: 'Modern, Secure & Bangla-First Communication Platform',

    // Navigation
    navChats: 'Chats',
    navAddabari: 'Addabari',
    navStories: 'Stories',
    navCalls: 'Calls',
    navAdmin: 'Admin',
    navSettings: 'Settings',
    navDeviceConnect: 'Link Device',
    navAI: 'AI Assistant',
    navLogout: 'Logout',

    // Common
    searchPlaceholder: 'Search chats or messages...',
    online: 'Online',
    offline: 'Offline',
    activeNow: 'Active now',
    typing: 'Typing...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    loading: 'Loading...',
    send: 'Send',
    copy: 'Copy',
    reply: 'Reply',
    edit: 'Edit',
    delete: 'Delete',
    pin: 'Pin',
    bookmark: 'Bookmark',
    bookmarked: 'Saved to Collections',
    share: 'Share',

    // Message Status
    sending: 'Sending',
    sent: 'Sent',
    delivered: 'Delivered',
    seen: 'Seen',

    // Topics
    all: 'All',
    topicStudy: 'Study',
    topicFriends: 'Friends',
    topicWork: 'Work',
    topicProject: 'Project',
    addTopic: 'Select Topic',

    // Addabari
    addabariTitle: 'Addabari',
    addabariSubtitle: 'Your Personal Communication Hub',
    quickStats: "Today's Highlights",
    totalChats: 'Total Chats',
    unreadMessages: 'Unread Messages',
    activeRooms: 'Active Rooms',
    pinnedRooms: 'Pinned Rooms',
    quickAddaBtn: 'Launch Quick Adda',
    recentActivity: 'Recent Activity',
    savedMessagesPreview: 'Saved Messages',
    noPinnedRooms: 'No chats pinned yet',

    // Quick Adda
    quickAddaTitle: 'Quick Adda',
    quickAddaSubtitle: 'Spin up an instant room and invite your friends in one tap',
    roomName: 'Room Name',
    roomNamePlaceholder: 'e.g., Weekend Hangout or Project Sprint...',
    selectTopic: 'Topic & Category',
    createRoomBtn: 'Create Room',
    roomCode: 'Room Code',
    copyInviteLink: 'Copy Invite Link',

    // Shared Board
    sharedBoardTitle: 'Shared Board',
    sharedBoardSubtitle: 'Pinned notices, collaborative checklists & room updates',
    pinnedNotices: 'Pinned Notices',
    roomChecklist: 'Room Checklist',
    addChecklistItem: 'Add a new task...',
    sharedPoll: 'Quick Poll',

    // Collections
    collectionsTitle: 'Collections',
    collectionsSubtitle: 'Your saved important messages and links',
    allCollections: 'All Messages',
    importantTab: 'Important',
    mediaTab: 'Media & Files',
    linksTab: 'Links',
    noSavedMessages: 'No saved messages. Bookmark any message in chat to save it here.',

    // Settings & Privacy
    settingsTitle: 'Profile & Settings',
    privacySnapshotTitle: 'Privacy Snapshot',
    privacyDesc: 'Control who can see your profile, status, and stories',
    trustedDevicesTitle: 'Trusted Devices',
    currentDevice: 'Current Device (This Browser)',
    quietHoursTitle: 'Quiet Hours',
    quietHoursDesc: 'Automatically mute notifications and sounds during designated hours',
    activeSessions: 'Active Sessions',
    logoutOtherDevices: 'Logout from all other devices',

    // Auth
    loginTitle: 'Welcome to Adda',
    loginSubtitle: 'Sign in to start messaging with friends and teams',
    usernameOrEmail: 'Username or Email',
    password: 'Password',
    loginBtn: 'Sign In',
    quickDemoAccounts: 'Quick Demo Login:',
    demoAlice: 'Alice (Designer)',
    demoBob: 'Bob (Engineer)',
    demoAdmin: 'Admin',

    // PWA
    pwaTitle: 'Install Adda App',
    pwaDesc: 'Install on phone or desktop for quick instant access',
    installBtn: 'Install',
  },
};

export function useLanguage() {
  const [lang, setLangState] = useState<Language>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('adda_lang') as Language;
    if (saved === 'bn' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('adda_lang', newLang);
  };

  const toggleLanguage = () => {
    const next = lang === 'bn' ? 'en' : 'bn';
    setLanguage(next);
  };

  const t = translations[lang];

  return { lang, setLanguage, toggleLanguage, t };
}
