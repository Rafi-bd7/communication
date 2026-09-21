'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface AudioRecorderProps {
  onAudioRecorded: (fileUrl: string, duration: number) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onAudioRecorded, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    startRecording();
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Could not access microphone.');
      onCancel();
    }
  };

  const handleSend = async () => {
    if (!mediaRecorderRef.current) return;

    clearInterval(timerRef.current);
    setIsUploading(true);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

      try {
        const uploadRes = await api.uploadFile(audioFile);
        onAudioRecorded(uploadRes.url, seconds);
      } catch (err) {
        alert('Failed to send voice note.');
        onCancel();
      } finally {
        setIsUploading(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handleCancel = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    onCancel();
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center justify-between w-full bg-brand-card/90 border border-brand-emerald/40 rounded-2xl px-4 py-2.5 shadow-lg animate-fade-in text-white">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-sm font-semibold tracking-wide text-red-400">
          {formatDuration(seconds)}
        </span>
        <span className="text-xs text-gray-400">Recording voice message...</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Cancel"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={isUploading || seconds < 1}
          className="px-3.5 py-1.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-brand-emerald/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {isUploading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
