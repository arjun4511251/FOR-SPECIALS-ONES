/**
 * Reliable romantic audio engine
 * Provides both procedural dreamy music box melody (Web Audio API)
 * and custom audio streaming support without external dependencies.
 */

class RomanticAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.65;
  private timerId: number | null = null;
  private currentNoteIndex: number = 0;
  private externalAudio: HTMLAudioElement | null = null;
  private customUrl: string | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();

  // Romantic music box notes (Happy Birthday / Gentle Love Song)
  // Frequency in Hz, note duration in seconds
  private melody: { freq: number; duration: number }[] = [
    // Gentle romantic melody in C major / F major
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 293.66, duration: 0.8 }, // D4
    { freq: 261.63, duration: 0.8 }, // C4
    { freq: 349.23, duration: 0.8 }, // F4
    { freq: 329.63, duration: 1.2 }, // E4
    { freq: 0, duration: 0.3 },      // pause
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 293.66, duration: 0.8 }, // D4
    { freq: 261.63, duration: 0.8 }, // C4
    { freq: 392.00, duration: 0.8 }, // G4
    { freq: 349.23, duration: 1.2 }, // F4
    { freq: 0, duration: 0.3 },      // pause
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 523.25, duration: 0.8 }, // C5
    { freq: 440.00, duration: 0.8 }, // A4
    { freq: 349.23, duration: 0.8 }, // F4
    { freq: 329.63, duration: 0.8 }, // E4
    { freq: 293.66, duration: 1.0 }, // D4
    { freq: 0, duration: 0.3 },      // pause
    { freq: 466.16, duration: 0.4 }, // Bb4
    { freq: 466.16, duration: 0.4 }, // Bb4
    { freq: 440.00, duration: 0.8 }, // A4
    { freq: 349.23, duration: 0.8 }, // F4
    { freq: 392.00, duration: 0.8 }, // G4
    { freq: 349.23, duration: 1.5 }, // F4
    { freq: 0, duration: 0.8 },      // long rest
    // Secondary romantic arpeggio loop (Canon in D vibe)
    { freq: 329.63, duration: 0.5 }, // E4
    { freq: 392.00, duration: 0.5 }, // G4
    { freq: 523.25, duration: 0.7 }, // C5
    { freq: 440.00, duration: 0.5 }, // A4
    { freq: 349.23, duration: 0.5 }, // F4
    { freq: 293.66, duration: 0.7 }, // D4
    { freq: 261.63, duration: 1.2 }, // C4
    { freq: 0, duration: 0.6 },
  ];

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setCustomUrl(url: string | null) {
    this.customUrl = url;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.externalAudio) {
      this.externalAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isPlaying));
  }

  public play() {
    this.isPlaying = true;
    this.notify();

    if (this.customUrl && this.customUrl.trim().length > 0) {
      if (!this.externalAudio) {
        this.externalAudio = new Audio(this.customUrl);
        this.externalAudio.loop = true;
      } else {
        this.externalAudio.src = this.customUrl;
      }
      this.externalAudio.volume = this.volume;
      this.externalAudio.play().catch(() => {
        // Fallback to music box procedural synth if external file fails
        this.playMusicBox();
      });
      return;
    }

    this.playMusicBox();
  }

  private playMusicBox() {
    this.initAudioContext();
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.stepMusicBox();
  }

  private playTone(freq: number, duration: number) {
    if (!this.audioCtx || freq <= 0 || this.volume <= 0) return;

    try {
      const now = this.audioCtx.currentTime;

      // Primary gentle chime oscillator
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();

      // Shimmer overtone oscillator (bell-like high harmonic)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.01, now); // slightly detuned harmonic for music-box warmth

      const maxGain = this.volume * 0.28;

      // Music box envelope: instant crisp strike with exponential ring-out
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(maxGain, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.4, duration * 1.5));

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(maxGain * 0.25, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.3, duration * 0.8));

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(this.audioCtx.destination);
      gain2.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration * 1.6);
      osc2.stop(now + duration * 1.6);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  private stepMusicBox = () => {
    if (!this.isPlaying) return;

    const note = this.melody[this.currentNoteIndex];
    if (note.freq > 0) {
      this.playTone(note.freq, note.duration);
    }

    const noteDurationMs = note.duration * 1000;
    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    this.timerId = window.setTimeout(this.stepMusicBox, noteDurationMs);
  };

  public pause() {
    this.isPlaying = false;
    this.notify();

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.externalAudio) {
      this.externalAudio.pause();
    }
  }

  public stop() {
    this.pause();
    this.currentNoteIndex = 0;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const romanticAudio = new RomanticAudioPlayer();
