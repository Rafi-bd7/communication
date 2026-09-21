'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { soundFX } from '@/lib/audioSounds';

export interface SocketEventHandlers {
  onMessage?: (data: any) => void;
  onTyping?: (data: { conversation_id: string; user_id: string; is_typing: boolean }) => void;
  onPresence?: (data: { event: string; user_id: string; timestamp?: string }) => void;
  onReaction?: (data: any) => void;
  onCallSignal?: (data: any) => void;
}

export function useSocket(handlers: SocketEventHandlers = {}) {
  const { token, user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isLocalDev = window.location.port === '3000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'));
    const wsUrl = isLocalDev 
      ? `${protocol}//${window.location.hostname}:8000/ws?token=${token}`
      : `${protocol}//${window.location.host}/ws?token=${token}`;

    let socket: WebSocket;
    let reconnectTimeout: any = null;

    const connect = () => {
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chat' && data.event === 'new_message') {
            if (data.message?.sender_id !== user.id) {
              soundFX.playMessageReceived();
            }
            handlersRef.current.onMessage?.(data);
          } else if (data.type === 'typing') {
            handlersRef.current.onTyping?.(data);
          } else if (data.type === 'presence') {
            handlersRef.current.onPresence?.(data);
          } else if (data.type === 'chat' && data.event === 'reaction_updated') {
            handlersRef.current.onReaction?.(data);
          } else if (data.type === 'webrtc' || ['webrtc_offer', 'webrtc_answer', 'ice_candidate', 'call_reject', 'call_end'].includes(data.type)) {
            handlersRef.current.onCallSignal?.(data);
          }
        } catch (err) {
          console.error('Socket message parse error:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Reconnect attempt in 3s
        reconnectTimeout = setTimeout(() => {
          if (token) connect();
        }, 3000);
      };

      socket.onerror = (err) => {
        socket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [token, user]);

  const sendTyping = useCallback((target_user_id: string, conversation_id: string, is_typing: boolean) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        target_user_id,
        conversation_id,
        is_typing
      }));
    }
  }, []);

  const sendCallSignal = useCallback((type: string, target_user_id: string, payload: any, call_id?: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type,
        target_user_id,
        payload,
        call_id
      }));
    }
  }, []);

  return {
    isConnected,
    sendTyping,
    sendCallSignal
  };
}
