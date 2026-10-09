'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import { soundFX } from '@/lib/audioSounds';

// Components
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ChatList, ConversationItem } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { StatusTray, StatusItem } from '@/components/status/StatusTray';
import { StatusViewerModal } from '@/components/status/StatusViewerModal';
import { CreateStatusModal } from '@/components/status/CreateStatusModal';
import { CallsHistoryView } from '@/components/calls/CallsHistoryView';
import { CallModal } from '@/components/calls/CallModal';
// AI features removed
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { DeviceConnectModal } from '@/components/layout/DeviceConnectModal';
import { MessageItem } from '@/components/chat/MessageBubble';

// Adda Social (Facebook + Messenger + WhatsApp) Components
import { DiscoverPeopleModal } from '@/components/social/DiscoverPeopleModal';
import { UserProfileModal } from '@/components/social/UserProfileModal';
import { TimelineFeedDrawer } from '@/components/social/TimelineFeedDrawer';

// Adda Unique Components
import { AddabariDashboard } from '@/components/adda/AddabariDashboard';
import { QuickAddaModal } from '@/components/adda/QuickAddaModal';
import { MessageCollectionsModal, SavedMessageItem } from '@/components/adda/MessageCollectionsModal';
import { UserHomePage } from '@/components/home/UserHomePage';

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { t, lang } = useLanguage();

  // Navigation tabs: 'home' | 'chats' | 'calls' | 'status'
  const [activeTab, setActiveTab] = useState('home');

  // Chats & Messages
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Stories / Statuses
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [activeStoryViewer, setActiveStoryViewer] = useState<StatusItem | null>(null);
  const [showCreateStatusModal, setShowCreateStatusModal] = useState(false);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeviceConnectOpen, setIsDeviceConnectOpen] = useState(false);
  const [isQuickAddaOpen, setIsQuickAddaOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  // Social: Facebook Profile, Discover People & Timeline Feed
  const [isDiscoverPeopleOpen, setIsDiscoverPeopleOpen] = useState(false);
  const [isTimelineFeedOpen, setIsTimelineFeedOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const handleStartDirectChat = async (targetUserId: string) => {
    try {
      const conv = await api.createDirectChat(targetUserId);
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === conv.id);
        if (existing) return prev;
        return [conv, ...prev];
      });
      setActiveConversation(conv);
      setActiveTab('chats');
      setIsDiscoverPeopleOpen(false);
      setIsUserProfileOpen(false);
      setIsTimelineFeedOpen(false);
      // Also refresh the full conversations list
      setTimeout(() => loadConversations(), 500);
    } catch (err) {
      console.error('Failed to create direct chat:', err);
    }
  };

  const handleOpenUserProfile = (userToView: any) => {
    setSelectedProfileUser(userToView);
    setIsUserProfileOpen(true);
  };

  // Saved Messages Collection
  const [savedMessages, setSavedMessages] = useState<SavedMessageItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adda_saved_messages');
      if (stored) {
        setSavedMessages(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const handleSaveToCollections = (msg: MessageItem) => {
    const isAlreadySaved = savedMessages.some(m => m.id === msg.id);
    if (isAlreadySaved) {
      alert(lang === 'bn' ? 'বার্তাটি ইতিমধ্যে সংগ্রহে রয়েছে।' : 'Message already saved in collections.');
      return;
    }

    const newItem: SavedMessageItem = {
      id: msg.id,
      senderName: msg.sender?.full_name || 'User',
      senderAvatar: msg.sender?.avatar_url,
      content: msg.content,
      savedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      category: msg.message_type === 'image' || msg.message_type === 'file' ? 'media' : 'important',
    };

    const updated = [newItem, ...savedMessages];
    setSavedMessages(updated);
    localStorage.setItem('adda_saved_messages', JSON.stringify(updated));
    alert(lang === 'bn' ? 'বার্তাটি সংগ্রহে যুক্ত হয়েছে!' : 'Message saved to your Adda collections!');
  };

  const handleRemoveFromCollections = (id: string) => {
    const updated = savedMessages.filter(m => m.id !== id);
    setSavedMessages(updated);
    localStorage.setItem('adda_saved_messages', JSON.stringify(updated));
  };

  // Calling States
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [activeCall, setActiveCall] = useState<any | null>(null);

  // 1. Load initial conversations & statuses
  const loadConversations = useCallback(async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (!activeConversation && convs.length > 0 && window.innerWidth >= 768) {
        setActiveConversation(convs[0]);
      }
    } catch (e) {}
  }, [activeConversation]);

  const loadStatuses = useCallback(async () => {
    try {
      const s = await api.getStatuses();
      setStatuses(s);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadConversations();
      loadStatuses();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [user, authLoading, router, loadConversations, loadStatuses]);

  // 2. Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    api.getMessages(activeConversation.id)
      .then((data) => setMessages(data))
      .catch(() => {});
  }, [activeConversation]);

  const callTargetRef = useRef<{ targetId: string; callId?: string } | null>(null);
  const sendCallSignalRef = useRef<((type: string, target_user_id: string, payload: any, call_id?: string) => void) | null>(null);

  // 3. WebRTC Engine
  const handleWebRTCSignalOut = useCallback((type: string, payload: any) => {
    const targetId = callTargetRef.current?.targetId || activeCall?.targetUser?.id || incomingCall?.caller?.id;
    const callId = callTargetRef.current?.callId || activeCall?.call_id || incomingCall?.call_id;
    if (targetId && sendCallSignalRef.current) {
      sendCallSignalRef.current(type, targetId, payload, callId);
    }
  }, [activeCall, incomingCall]);

  const {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    startLocalMedia,
    createOffer,
    handleOffer,
    answerCall,
    handleAnswer,
    handleIceCandidate,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    stopAllMedia
  } = useWebRTC(handleWebRTCSignalOut);

  // 4. WebSocket Event Handlers
  const handleIncomingMessage = useCallback((msg: MessageItem) => {
    if (activeConversation && msg.conversation_id === activeConversation.id) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    // Trigger Native Notification for incoming message from other user
    if (msg.sender_id !== user?.id) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(msg.sender?.full_name || 'Adda বার্তা', {
            body: msg.content || (msg.file_url ? '📷 ফাইল/ছবি পাঠিয়েছেন' : 'নতুন বার্তা এসেছে'),
            icon: msg.sender?.avatar_url || '/icons/icon-192.png',
            tag: `msg-${msg.conversation_id}`,
          });
        } catch (e) {}
      }
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === msg.conversation_id) {
          return {
            ...c,
            last_message: {
              id: msg.id,
              content: msg.content,
              message_type: msg.message_type,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
            },
            updated_at: msg.created_at,
            unread_count: activeConversation?.id === c.id ? 0 : c.unread_count + 1,
          };
        }
        return c;
      })
    );
  }, [activeConversation, user]);

  const handleMessageUpdated = useCallback((msg: MessageItem) => {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
  }, []);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const handleReactionUpdated = useCallback((data: { message_id: string; reactions: any[] }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === data.message_id) {
          return { ...m, reactions: data.reactions };
        }
        return m;
      })
    );
  }, []);

  const handleTypingEventReceived = useCallback((userId: string, isTyping: boolean) => {
    setTypingUsers((prev) => {
      if (isTyping && !prev.includes(userId)) return [...prev, userId];
      if (!isTyping) return prev.filter((id) => id !== userId);
      return prev;
    });
  }, []);

  const handleUserPresence = useCallback((userId: string, isOnline: boolean) => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        members: conv.members.map((m) => {
          if (m.user_id === userId) {
            return { ...m, user: { ...m.user, is_online: isOnline } };
          }
          return m;
        }),
      }))
    );
  }, []);

  const handleIncomingCallEvent = useCallback((callData: any) => {
    soundFX.startRingtone();
    setIncomingCall(callData);
    const callerId = callData.caller?.id || callData.caller_id || callData.sender_id;
    const callerName = callData.caller?.full_name || 'Adda Contact';
    callTargetRef.current = { targetId: callerId, callId: callData.call_id };

    // Trigger Native Notification on Mobile / Desktop
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`📞 ${callerName}`, {
          body: `${callData.call_type === 'video' ? 'ভিডিও কল' : 'ভয়েস কল'} আসছে... রিসিভ করতে ট্যাপ করুন`,
          icon: callData.caller?.avatar_url || '/icons/icon-192.png',
          tag: 'adda-incoming-call',
        });
      } catch (e) {}
    }
  }, []);

  const handleRemoteCallEnded = useCallback((data?: any) => {
    soundFX.stopRingtone();
    setActiveCall(null);
    setIncomingCall(null);
    callTargetRef.current = null;
    stopAllMedia();
  }, [stopAllMedia]);

  const handleCallSignalReceived = useCallback(async (signalType: string, payload: any, senderId?: string) => {
    if (senderId && (!callTargetRef.current?.targetId || callTargetRef.current.targetId === 'undefined')) {
      callTargetRef.current = { ...callTargetRef.current, targetId: senderId };
    }

    if (signalType === 'webrtc_offer') {
      await handleOffer(payload);
    } else if (signalType === 'webrtc_answer') {
      await handleAnswer(payload);
    } else if (signalType === 'ice_candidate') {
      await handleIceCandidate(payload);
    }
  }, [handleOffer, handleAnswer, handleIceCandidate]);

  // Connect WebSocket
  const {
    sendTyping: sendWSTyping,
    sendCallSignal,
  } = useSocket({
    onMessage: (data) => {
      if (data.message) {
        handleIncomingMessage(data.message);
      }
    },
    onTyping: (data) => {
      handleTypingEventReceived(data.user_id, data.is_typing);
    },
    onPresence: (data) => {
      handleUserPresence(data.user_id, data.event === 'online');
    },
    onReaction: (data) => {
      if (data.data) {
        handleReactionUpdated(data.data);
      }
    },
    onCallSignal: (data) => {
      const isIncoming = data.type === 'incoming_call' || data.event === 'incoming_call';
      const isCallEnded = data.type === 'call_end' || data.type === 'call_reject' || data.event === 'call_ended';

      if (isIncoming) {
        handleIncomingCallEvent(data);
      } else if (isCallEnded) {
        handleRemoteCallEnded(data);
      } else {
        handleCallSignalReceived(data.type, data.payload, data.sender_id);
      }
    },
  });

  sendCallSignalRef.current = sendCallSignal;

  // Actions
  const handleSendMessage = async (payload: { content: string; message_type: string; file?: File; reply_to_id?: string }) => {
    if (!activeConversation) return;
    try {
      let fileUrl = undefined;
      let fileName = undefined;
      let fileSize = undefined;

      if (payload.file) {
        const uploadRes = await api.uploadMedia(payload.file);
        fileUrl = uploadRes.url;
        fileName = uploadRes.filename;
        fileSize = uploadRes.size;
      }

      const res = await api.sendMessage(activeConversation.id, {
        content: payload.content,
        message_type: payload.message_type,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        reply_to_id: payload.reply_to_id,
      });

      setMessages((prev) => (prev.some((m) => m.id === res.id) ? prev : [...prev, res]));
      soundFX.playMessageSent();

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              last_message: {
                id: res.id,
                content: res.content,
                message_type: res.message_type,
                created_at: res.created_at,
                sender_id: res.sender_id,
              },
              updated_at: res.created_at,
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.message || 'Failed to send message');
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const updated = await api.editMessage(messageId, content);
      handleMessageUpdated(updated);
    } catch (e) {
      alert('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.deleteMessage(messageId);
      handleMessageDeleted(messageId);
    } catch (e) {
      alert('Failed to delete message');
    }
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    try {
      const res = await api.reactMessage(messageId, emoji);
      handleReactionUpdated({ message_id: messageId, reactions: res.reactions });
    } catch (e) {
      alert('Failed to react');
    }
  };

  const handleTypingEvent = (isTyping: boolean) => {
    if (activeConversation) {
      const otherMember = activeConversation.members?.find((m) => m.user_id !== user?.id)?.user;
      if (otherMember) {
        sendWSTyping(otherMember.id, activeConversation.id, isTyping);
      }
    }
  };

  // Call Flows
  const handleStartCall = async (callType: 'voice' | 'video', targetContact?: any) => {
    const target = targetContact || activeConversation?.members?.find((m) => m.user_id !== user?.id)?.user;
    if (!target) return;

    try {
      const callData = await api.initiateCall(target.id, callType);
      setActiveCall({
        call_id: callData.id,
        call_type: callType,
        targetUser: target,
      });
      callTargetRef.current = { targetId: target.id, callId: callData.id };
      await startLocalMedia(callType === 'video');
      await createOffer();
      soundFX.startRingtone();
    } catch (err) {
      alert('Could not start call');
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    soundFX.stopRingtone();
    const callerUser = incomingCall.caller;
    const callId = incomingCall.call_id;
    const callType = incomingCall.call_type;
    const callerId = callerUser?.id || incomingCall.caller_id || incomingCall.sender_id;

    callTargetRef.current = { targetId: callerId, callId: callId };
    setActiveCall({
      call_id: callId,
      call_type: callType,
      targetUser: callerUser,
    });
    setIncomingCall(null);

    // Notify caller that call was accepted
    if (callerId && sendCallSignalRef.current) {
      sendCallSignalRef.current('call_accept', callerId, {}, callId);
    }

    try {
      await api.updateCallStatus(callId, 'accepted');
    } catch (e) {}

    // Start local media first
    await startLocalMedia(callType === 'video');

    // Create and send WebRTC answer
    await answerCall();
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    soundFX.stopRingtone();
    const callerId = incomingCall.caller?.id || incomingCall.caller_id || incomingCall.sender_id;
    const callId = incomingCall.call_id;

    if (callerId && sendCallSignalRef.current) {
      sendCallSignalRef.current('call_reject', callerId, {}, callId);
    }

    try {
      await api.updateCallStatus(callId, 'declined');
    } catch (err) {}

    setIncomingCall(null);
    callTargetRef.current = null;
    stopAllMedia();
  };

  const handleEndCall = async () => {
    soundFX.stopRingtone();
    const targetId = callTargetRef.current?.targetId || activeCall?.targetUser?.id;
    const callId = activeCall?.call_id || incomingCall?.call_id;

    if (targetId && sendCallSignalRef.current) {
      sendCallSignalRef.current('call_end', targetId, {}, callId);
    }

    if (callId) {
      try {
        await api.updateCallStatus(callId, 'ended');
      } catch (err) {}
    }

    stopAllMedia();
    setActiveCall(null);
    setIncomingCall(null);
    callTargetRef.current = null;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b141a] text-white">
      {/* 1. App Sidebar Navigation */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'feed') {
            setIsTimelineFeedOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        openSettings={() => setIsSettingsOpen(true)}
        openDeviceConnect={() => setIsDeviceConnectOpen(true)}
        openDiscoverPeople={() => setIsDiscoverPeopleOpen(true)}
        openTimeline={() => setIsTimelineFeedOpen(true)}
        openMyProfile={() => {
          if (user) {
            setSelectedProfileUser(user);
            setIsUserProfileOpen(true);
          }
        }}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex h-full overflow-hidden relative">
        {/* Tab 0: Home Hub (Facebook Feed + Messenger Online Contacts + WhatsApp Stories) */}
        {activeTab === 'home' && (
          <UserHomePage
            statuses={statuses}
            onOpenCreateStory={() => setShowCreateStatusModal(true)}
            onOpenStoryViewer={(st) => setActiveStoryViewer(st)}
            onStartChat={handleStartDirectChat}
            onStartCall={(target, type) => handleStartCall(type, target)}
            onOpenDiscoverPeople={() => setIsDiscoverPeopleOpen(true)}
            onOpenQuickAdda={() => setIsQuickAddaOpen(true)}
            onViewProfile={handleOpenUserProfile}
          />
        )}

        {/* Tab 1: Chats */}
        {activeTab === 'chats' && (
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Left Chat List Column */}
            <div className={`h-full flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
              {/* 24h Stories Tray */}
              <StatusTray
                statuses={statuses}
                onOpenCreate={() => setShowCreateStatusModal(true)}
                onOpenViewer={(st) => setActiveStoryViewer(st)}
              />

              <ChatList
                conversations={conversations}
                selectedConversationId={activeConversation?.id}
                onSelectConversation={(c) => setActiveConversation(c)}
                onNewChatCreated={(newConv) => {
                  setConversations((prev) => [newConv, ...prev]);
                  setActiveConversation(newConv);
                }}
                onOpenQuickAdda={() => setIsQuickAddaOpen(true)}
                onOpenDiscoverPeople={() => setIsDiscoverPeopleOpen(true)}
                onOpenProfile={handleOpenUserProfile}
              />
            </div>

            {/* Right Chat Window */}
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                messages={messages}
                typingUsers={typingUsers}
                onBack={() => setActiveConversation(null)}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onReactMessage={handleReactMessage}
                onStartCall={(type) => handleStartCall(type)}
                onTyping={handleTypingEvent}
                onOpenProfile={handleOpenUserProfile}
              />
            ) : (
              <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center bg-[#111b21] p-8 text-center text-gray-400 select-none border-l border-[#2a3942]">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-emerald via-emerald-400 to-teal-300 flex items-center justify-center text-brand-dark mb-4 shadow-xl shadow-brand-emerald/20 font-black text-3xl">
                  আ
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-1">
                  Adda • {t.brandName}
                </h3>
                <p className="text-xs font-semibold text-brand-emerald mb-3">
                  {t.brandTagline}
                </p>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                  {lang === 'bn' 
                    ? 'আড্ডা রুমে যুক্ত হন, অডিও ও ভিডিও কল করুন, অথবা তাৎক্ষণিক ঝটপট আড্ডার মাধ্যমে টিম ও বন্ধুদের সাথে কানেক্ট থাকুন।' 
                    : 'Join Adda rooms, place instant voice & video calls, or spin up a Quick Adda with your friends and teammates.'}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsQuickAddaOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-brand-emerald text-brand-dark font-bold text-xs hover:brightness-110 shadow-lg shadow-brand-emerald/20 transition-all active:scale-95"
                  >
                    ⚡ {t.quickAddaBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addabari Personal Dashboard */}
        {activeTab === 'addabari' && (
          <AddabariDashboard
            conversations={conversations}
            onSelectConversation={(conv) => {
              setActiveConversation(conv);
              setActiveTab('chats');
            }}
            onOpenQuickAdda={() => setIsQuickAddaOpen(true)}
            onOpenCollections={() => setIsCollectionsOpen(true)}
          />
        )}

        {/* Tab 3: Status / Stories Tab */}
        {activeTab === 'status' && (
          <div className="flex-1 h-full p-4 md:p-8 bg-brand-dark overflow-y-auto">
            <div className="max-w-xl mx-auto flex flex-col gap-6">
              <h1 className="text-2xl font-bold">{lang === 'bn' ? '২৪ ঘণ্টার স্টোরি ও মুহূর্ত' : '24-Hour Stories'}</h1>
              <StatusTray
                statuses={statuses}
                onOpenCreate={() => setShowCreateStatusModal(true)}
                onOpenViewer={(st) => setActiveStoryViewer(st)}
              />
              <p className="text-xs text-gray-400">
                {lang === 'bn' 
                  ? 'স্টোরিগুলো ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে মুছে যায়। বন্ধুদের স্টোরি দেখতে ওপরে ক্লিক করুন অথবা নিজের মুহূর্ত শেয়ার করতে "+" চাপুন।' 
                  : 'Stories disappear automatically after 24 hours. Tap any contact above to view their story, or tap "+" to post your own!'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Calls Log Tab */}
        {activeTab === 'calls' && (
          <CallsHistoryView
            onStartCall={(contact, type) => handleStartCall(type, contact)}
          />
        )}

        {/* Tab 5: Admin Dashboard Tab */}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* 3. Global Modals & Drawers */}
      {/* WebRTC Video & Voice Call Modal */}
      <CallModal
        incomingCall={incomingCall}
        activeCall={activeCall}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        onAcceptCall={handleAcceptCall}
        onDeclineCall={handleDeclineCall}
        onEndCall={handleEndCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
      />

      {/* Quick Adda Modal */}
      <QuickAddaModal
        isOpen={isQuickAddaOpen}
        onClose={() => setIsQuickAddaOpen(false)}
        onRoomCreated={(newConv) => {
          setConversations((prev) => [newConv, ...prev]);
          setActiveConversation(newConv);
          setActiveTab('chats');
        }}
      />

      {/* Story Viewer Modal */}
      <StatusViewerModal
        status={activeStoryViewer}
        onClose={() => setActiveStoryViewer(null)}
        onStatusDeleted={(deletedId) => {
          setStatuses((prev) => prev.filter((s) => s.id !== deletedId));
          setActiveStoryViewer(null);
        }}
      />

      {/* Create Story Modal */}
      <CreateStatusModal
        isOpen={showCreateStatusModal}
        onClose={() => setShowCreateStatusModal(false)}
        onCreated={loadStatuses}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Connect Phone / Another Device Modal */}
      <DeviceConnectModal
        isOpen={isDeviceConnectOpen}
        onClose={() => setIsDeviceConnectOpen(false)}
      />

      {/* Facebook Style: Discover People & Friend Requests */}
      <DiscoverPeopleModal
        isOpen={isDiscoverPeopleOpen}
        onClose={() => setIsDiscoverPeopleOpen(false)}
        onStartChat={handleStartDirectChat}
        onViewProfile={handleOpenUserProfile}
      />

      {/* Facebook Style: User Public/Private Profile */}
      <UserProfileModal
        user={selectedProfileUser}
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        onStartChat={handleStartDirectChat}
        onStartCall={(target, type) => handleStartCall(type, target)}
      />

      {/* Facebook Style: Timeline Feed & Post Sharing */}
      <TimelineFeedDrawer
        isOpen={isTimelineFeedOpen}
        onClose={() => setIsTimelineFeedOpen(false)}
        onViewProfile={handleOpenUserProfile}
        onStartChat={handleStartDirectChat}
      />

      {/* Saved Collections Modal */}
      <MessageCollectionsModal
        isOpen={isCollectionsOpen}
        onClose={() => setIsCollectionsOpen(false)}
        savedMessages={savedMessages}
        onRemoveMessage={handleRemoveFromCollections}
      />
    </div>
  );
}
