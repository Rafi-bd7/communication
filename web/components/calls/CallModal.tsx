'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Maximize2 
} from 'lucide-react';
import { soundFX } from '@/lib/audioSounds';
import UserAvatar from '@/components/common/UserAvatar';

interface CallModalProps {
  incomingCall: {
    call_id: string;
    caller: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    call_type: string;
  } | null;
  activeCall: {
    call_id: string;
    targetUser: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    call_type: string;
  } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onAcceptCall: () => void;
  onDeclineCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

export function CallModal({
  incomingCall,
  activeCall,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onAcceptCall,
  onDeclineCall,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Bind local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  // Bind remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Handle incoming call ringtone
  useEffect(() => {
    if (incomingCall) {
      soundFX.startRingtone();
    } else {
      soundFX.stopRingtone();
    }
    return () => {
      soundFX.stopRingtone();
    };
  }, [incomingCall]);

  // Duration timer for active call
  useEffect(() => {
    if (!activeCall) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Incoming Call Prompt
  if (incomingCall && !activeCall) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
        <div className="bg-brand-surface border border-brand-emerald/40 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center shadow-2xl animate-fade-in text-white">
          <div className="relative mb-4">
            <UserAvatar
              name={incomingCall.caller.full_name}
              avatarUrl={incomingCall.caller.avatar_url}
              size="2xl"
              className="ring-4 ring-brand-emerald shadow-2xl animate-pulse-subtle"
            />
            <span className="absolute -bottom-1 right-2 p-1.5 rounded-full bg-brand-emerald text-brand-dark shadow">
              {incomingCall.call_type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </span>
          </div>

          <h3 className="font-semibold text-lg">{incomingCall.caller.full_name}</h3>
          <p className="text-xs text-gray-400 mb-6">
            Incoming {incomingCall.call_type === 'video' ? 'Video' : 'Voice'} Call...
          </p>

          <div className="flex items-center gap-6 w-full justify-center">
            {/* Decline Button */}
            <button
              onClick={onDeclineCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Accept Button */}
            <button
              onClick={onAcceptCall}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all animate-bounce"
              title="Accept"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Call Window
  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none">
      {/* Top Call Info */}
      <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent text-white">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={activeCall.targetUser.full_name}
            avatarUrl={activeCall.targetUser.avatar_url}
            size="md"
          />
          <div>
            <h4 className="font-semibold text-sm">{activeCall.targetUser.full_name}</h4>
            <span className="text-xs text-emerald-400 font-mono">{formatTimer(callDuration)}</span>
          </div>
        </div>
      </div>

      {/* Hidden audio element ensures voice calls always play audio even without video */}
      <audio
        ref={(el) => {
          if (el && remoteStream && el.srcObject !== remoteStream) {
            el.srcObject = remoteStream;
            el.play().catch(() => {});
          }
        }}
        autoPlay
        playsInline
      />

      {/* Main Video Stream Stage */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {activeCall.call_type === 'video' && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="relative flex items-center justify-center">
              <UserAvatar
                name={activeCall.targetUser.full_name}
                avatarUrl={activeCall.targetUser.avatar_url}
                size="2xl"
                className="ring-4 ring-brand-emerald p-1"
              />
              <span className="absolute inset-0 rounded-full border-4 border-brand-emerald/40 animate-ping pointer-events-none" />
            </div>
            <p className="text-sm font-medium text-gray-300">
              {remoteStream 
                ? (activeCall.call_type === 'video' ? 'ভিডিও কল সংযুক্ত' : 'কথা বলুন... কল চলছে 🎙️') 
                : 'কানেক্ট হচ্ছে... অপেক্ষা করুন'}
            </p>
          </div>
        )}

        {/* Local PIP Video Stream */}
        {localStream && (
          <div className="absolute top-4 right-4 w-28 h-40 md:w-36 md:h-48 rounded-2xl overflow-hidden border-2 border-brand-emerald/60 shadow-2xl bg-black z-30">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
            {isVideoOff && (
              <div className="w-full h-full flex items-center justify-center bg-brand-surface text-gray-400 text-xs font-medium">
                Camera Off
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Toolbar */}
      <div className="p-6 flex items-center justify-center gap-4 z-20 bg-gradient-to-t from-black/90 to-transparent">
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isScreenSharing ? 'bg-brand-emerald text-brand-dark' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
