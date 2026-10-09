function createRingtoneDataUri(): string {
  if (typeof window === 'undefined') return '';
  const sampleRate = 8000;
  const duration = 2.6;
  const totalSamples = Math.floor(sampleRate * duration);
  const ringDuration = 1.4;
  const ringSamples = Math.floor(sampleRate * ringDuration);
  
  const buffer = new Uint8Array(44 + totalSamples);
  // 'RIFF'
  buffer[0] = 0x52; buffer[1] = 0x49; buffer[2] = 0x46; buffer[3] = 0x46;
  const fileSize = 36 + totalSamples;
  buffer[4] = fileSize & 0xff; buffer[5] = (fileSize >> 8) & 0xff;
  buffer[6] = (fileSize >> 16) & 0xff; buffer[7] = (fileSize >> 24) & 0xff;
  // 'WAVE'
  buffer[8] = 0x57; buffer[9] = 0x41; buffer[10] = 0x56; buffer[11] = 0x45;
  // 'fmt '
  buffer[12] = 0x66; buffer[13] = 0x6d; buffer[14] = 0x74; buffer[15] = 0x20;
  buffer[16] = 16; buffer[17] = 0; buffer[18] = 0; buffer[19] = 0;
  buffer[20] = 1; buffer[21] = 0; // PCM
  buffer[22] = 1; buffer[23] = 0; // Mono
  buffer[24] = sampleRate & 0xff; buffer[25] = (sampleRate >> 8) & 0xff;
  buffer[26] = 0; buffer[27] = 0;
  buffer[28] = sampleRate & 0xff; buffer[29] = (sampleRate >> 8) & 0xff;
  buffer[30] = 0; buffer[31] = 0;
  buffer[32] = 1; buffer[33] = 0;
  buffer[34] = 8; buffer[35] = 0; // 8-bit
  // 'data'
  buffer[36] = 0x64; buffer[37] = 0x61; buffer[38] = 0x74; buffer[39] = 0x61;
  buffer[40] = totalSamples & 0xff; buffer[41] = (totalSamples >> 8) & 0xff;
  buffer[42] = (totalSamples >> 16) & 0xff; buffer[43] = (totalSamples >> 24) & 0xff;
  
  for (let i = 0; i < totalSamples; i++) {
    if (i < ringSamples) {
      const t = i / sampleRate;
      const sample = 0.5 * Math.sin(2 * Math.PI * 440 * t) + 0.5 * Math.sin(2 * Math.PI * 480 * t);
      buffer[44 + i] = Math.floor((sample + 1) * 127.5);
    } else {
      buffer[44 + i] = 128;
    }
  }
  
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

class SoundFX {
  private ctx: AudioContext | null = null;
  private ringInterval: any = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  async unlockAudio() {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (!this.audioElement && typeof window !== 'undefined') {
        const audio = new Audio();
        audio.src = createRingtoneDataUri();
        audio.loop = true;
        this.audioElement = audio;
      }
    } catch {}
  }

  // Sent message pop
  playMessageSent() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Incoming message chime
  playMessageReceived() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Note 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Note 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
      gain2.gain.setValueAtTime(0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  // Call ringtone loop (Audible sound + Mobile vibration)
  startRingtone() {
    this.stopRingtone();

    // 1. Play HTML5 Audio element ringtone (works across all browsers & background tabs)
    try {
      if (!this.audioElement && typeof window !== 'undefined') {
        const audio = new Audio();
        audio.src = createRingtoneDataUri();
        audio.loop = true;
        this.audioElement = audio;
      }
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch(() => {});
      }
    } catch {}

    // 2. Trigger mobile device vibration
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([1000, 500, 1000, 500, 1000]);
      } catch (e) {}
    }

    // 3. Web Audio dual-tone synthesis chime
    const playChime = () => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([800, 300, 800, 400]);
        } catch (e) {}
      }

      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        [440, 480].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.4);
        });
      } catch (e) {}
    };

    playChime();
    this.ringInterval = setInterval(playChime, 2400);
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
    }
    // Stop vibration
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }
}

export const soundFX = new SoundFX();
