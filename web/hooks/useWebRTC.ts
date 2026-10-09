'use client';

import { useState, useRef, useCallback } from 'react';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export function useWebRTC(onSignal: (type: string, payload: any) => void) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const createPeerConnection = useCallback(() => {
    // If existing and not closed, reuse
    if (pcRef.current && pcRef.current.signalingState !== 'closed') {
      return pcRef.current;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onSignal('ice_candidate', event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Attach local stream tracks if already captured
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStreamRef.current!);
        } catch (e) {
          console.warn('Could not attach existing track to PC:', e);
        }
      });
    }

    return pc;
  }, [onSignal]);

  const drainPendingCandidates = async (pc: RTCPeerConnection) => {
    while (pendingCandidatesRef.current.length > 0) {
      const candidate = pendingCandidatesRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('Flushing candidate warning:', err);
        }
      }
    }
  };

  const startLocalMedia = async (video: boolean = true) => {
    if (typeof window === 'undefined') return null;

    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn('Media devices API not available');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
        audio: true
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      // If peer connection exists, add tracks to it
      if (pcRef.current && pcRef.current.signalingState !== 'closed') {
        const senders = pcRef.current.getSenders();
        stream.getTracks().forEach((track) => {
          if (!senders.some(s => s.track === track)) {
            try {
              pcRef.current!.addTrack(track, stream);
            } catch (e) {
              console.warn('Could not add track:', e);
            }
          }
        });
      }
      return stream;
    } catch (err) {
      console.warn('Could not access full media device, trying audio only:', err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);

        if (pcRef.current && pcRef.current.signalingState !== 'closed') {
          const senders = pcRef.current.getSenders();
          audioStream.getTracks().forEach((track) => {
            if (!senders.some(s => s.track === track)) {
              try {
                pcRef.current!.addTrack(track, audioStream);
              } catch (e) {
                console.warn('Could not add audio track:', e);
              }
            }
          });
        }
        return audioStream;
      } catch (e) {
        console.error('No media devices accessible:', e);
        return null;
      }
    }
  };

  const createOffer = async () => {
    try {
      const pc = createPeerConnection();
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      onSignal('webrtc_offer', offer);
      return offer;
    } catch (err) {
      console.error('Error creating offer:', err);
      return null;
    }
  };

  // Called when receiving an offer from remote caller
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    pendingOfferRef.current = offer;
    const pc = createPeerConnection();

    try {
      // Check if we need to rollback local offer in case of collision
      if (pc.signalingState === 'have-local-offer') {
        try {
          await pc.setLocalDescription({ type: 'rollback' });
        } catch (e) {
          console.warn('Rollback failed:', e);
        }
      }

      // Only setRemoteDescription if state allows
      if ((pc.signalingState as string) === 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await drainPendingCandidates(pc);

        // Guard: only create and set local answer if we are in have-remote-offer
        if ((pc.signalingState as string) === 'have-remote-offer') {
          const answer = await pc.createAnswer();
          if ((pc.signalingState as string) === 'have-remote-offer') {
            await pc.setLocalDescription(answer);
            onSignal('webrtc_answer', answer);
          }
        }
      }
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  // Called when receiver accepts call and wants to generate/send answer
  const answerCall = async (incomingOffer?: RTCSessionDescriptionInit) => {
    const offer = incomingOffer || pendingOfferRef.current;
    if (!offer) {
      console.warn('No offer available to answer');
      return;
    }

    const pc = createPeerConnection();
    try {
      if ((pc.signalingState as string) === 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await drainPendingCandidates(pc);
      }

      if ((pc.signalingState as string) === 'have-remote-offer') {
        const answer = await pc.createAnswer();
        if ((pc.signalingState as string) === 'have-remote-offer') {
          await pc.setLocalDescription(answer);
          onSignal('webrtc_answer', answer);
        }
      }
    } catch (err) {
      console.error('Error creating answer:', err);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (pcRef.current && pcRef.current.signalingState === 'have-local-offer') {
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await drainPendingCandidates(pcRef.current);
      } catch (err) {
        console.error('Error setting remote answer:', err);
      }
    } else {
      console.log('Skipping setRemoteDescription for answer, signalingState:', pcRef.current?.signalingState);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!candidate) return;
    if (pcRef.current && pcRef.current.remoteDescription && pcRef.current.signalingState !== 'closed') {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Error adding ICE candidate:', e);
      }
    } else {
      pendingCandidatesRef.current.push(candidate);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is not supported in this browser.');
        return;
      }
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (pcRef.current && pcRef.current.signalingState !== 'closed') {
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error('Error starting screen share:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current && pcRef.current && pcRef.current.signalingState !== 'closed') {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && cameraTrack) {
        sender.replaceTrack(cameraTrack);
      }
    }
    setIsScreenSharing(false);
  };

  const stopAllMedia = () => {
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = null;
    }
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  return {
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
  };
}
