import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, Heart, Sparkles, Delete, HelpCircle, ArrowLeft, KeyRound, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SecretLockScreenProps {
  passcode?: string;
  hint?: string;
  title?: string;
  subtitle?: string;
  recipientName?: string;
  senderName?: string;
  onUnlock: () => void;
  onBack: () => void;
}

export const SecretLockScreen: React.FC<SecretLockScreenProps> = ({
  passcode = '2026',
  hint = 'The special year of our sweetest story 💖 (2026)',
  title = 'Secret Love Vault',
  subtitle = 'Enter our 4-digit code to unlock your birthday scrapbook',
  recipientName = 'Sarah',
  senderName = 'Alex',
  onUnlock,
  onBack,
}) => {
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const cleanTargetPasscode = passcode.trim() || '2026';
  const targetLength = cleanTargetPasscode.length;

  // Gentle audio chime using Web Audio API when buttons are pressed or unlocked
  const playChime = useCallback((freq = 523.25, duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }, []);

  const triggerSuccess = useCallback(() => {
    setIsUnlocked(true);
    setIsError(false);
    setErrorMessage('');

    // High celebration chimes
    playChime(659.25, 0.15); // E5
    setTimeout(() => playChime(783.99, 0.15), 100); // G5
    setTimeout(() => playChime(1046.5, 0.35), 200); // C6

    // Multi-stage romantic confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f43f68', '#fbcfe8', '#f472b6', '#ffd166', '#fed7aa'],
      });
    } catch {}

    // Delay slightly to show unlocked animation before transitioning
    setTimeout(() => {
      onUnlock();
    }, 850);
  }, [playChime, onUnlock]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (isUnlocked) return;
      if (enteredCode.length >= targetLength) return;

      playChime(440 + enteredCode.length * 70, 0.08);
      const nextCode = enteredCode + digit;
      setEnteredCode(nextCode);
      setIsError(false);

      if (nextCode.length === targetLength) {
        if (nextCode === cleanTargetPasscode) {
          triggerSuccess();
        } else {
          setIsError(true);
          setErrorMessage('Oops, not quite! Try again, sweetie 💕');
          playChime(220, 0.2); // low buzz
          setTimeout(() => {
            setEnteredCode('');
            setIsError(false);
          }, 700);
        }
      }
    },
    [enteredCode, targetLength, cleanTargetPasscode, isUnlocked, playChime, triggerSuccess]
  );

  const handleDelete = useCallback(() => {
    if (isUnlocked) return;
    if (enteredCode.length > 0) {
      playChime(350, 0.06);
      setEnteredCode((prev) => prev.slice(0, -1));
      setIsError(false);
    }
  }, [enteredCode, isUnlocked, playChime]);

  const handleClear = useCallback(() => {
    if (isUnlocked) return;
    setEnteredCode('');
    setIsError(false);
  }, [isUnlocked]);

  // Support physical keyboard input (digits, backspace, escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlocked) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete, handleClear, isUnlocked]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-black/40 via-black/25 to-black/45 backdrop-blur-[2px]">
      {/* Gentle Floating Lock Elements / Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-300/35 animate-float-slow select-none text-xl"
            style={{
              top: `${(i * 17) % 92}%`,
              left: `${(i * 23) % 92}%`,
              animationDelay: `${(i % 5) * 0.8}s`,
            }}
          >
            {i % 3 === 0 ? '🔒' : i % 3 === 1 ? '💖' : '🗝️'}
          </div>
        ))}
      </div>

      {/* Main Glass Lock Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md glass-panel rounded-3xl p-6 sm:p-9 text-center shadow-2xl border border-white/70">
        {/* Top Washi Tape */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape-pink w-32 h-6 rounded-xs shadow-xs -rotate-1"></div>

        {/* Back to Opening Question Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-pink-700 hover:text-pink-900 glass-panel-subtle px-3 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer hover:bg-white/70 active:scale-95"
            title="Back to first page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-[11px] font-semibold text-rose-700/80 glass-panel-subtle px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span>Protected with Love</span>
          </span>
        </div>

        {/* Padlock Visual Icon */}
        <div className="relative my-3 flex justify-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl border ${
              isUnlocked
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white border-white/60 scale-110 rotate-6 shadow-emerald-500/30'
                : isError
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white border-white/60 animate-shake shadow-rose-600/40'
                : 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white border-white/40 shadow-rose-500/30'
            }`}
          >
            {isUnlocked ? (
              <Unlock className="w-10 h-10 animate-bounce" />
            ) : (
              <Lock className="w-10 h-10" />
            )}
          </div>

          {/* Glowing mini badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white/90 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-rose-200 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            <span>{isUnlocked ? 'Unlocked!' : 'Private'}</span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h2 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-4 mb-1">
          {title}
        </h2>
        <p className="font-handwriting text-xl text-pink-700 mb-5">
          {subtitle}
        </p>

        {/* PIN Dots Display with Heart Glyphs */}
        <div
          className={`flex items-center justify-center gap-3.5 sm:gap-4 my-5 transition-transform ${
            isError ? 'animate-shake' : ''
          }`}
        >
          {Array.from({ length: targetLength }).map((_, index) => {
            const isFilled = index < enteredCode.length;
            const isCurrent = index === enteredCode.length;

            return (
              <div
                key={index}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 text-xl border ${
                  isUnlocked
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-600 scale-105 shadow-md shadow-emerald-500/20'
                    : isFilled
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30 scale-105'
                    : isCurrent
                    ? 'bg-white/80 border-rose-400 text-rose-400 ring-2 ring-rose-300/70 shadow-inner'
                    : 'bg-white/40 border-white/70 text-slate-300 shadow-inner'
                }`}
              >
                {isUnlocked ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : isFilled ? (
                  <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400/40" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error or Success feedback message */}
        <div className="h-6 flex items-center justify-center mb-3">
          {isError && (
            <p className="text-xs font-semibold text-rose-600 animate-fade-in flex items-center gap-1">
              <span>{errorMessage || 'Incorrect code! Try again 💕'}</span>
            </p>
          )}
          {isUnlocked && (
            <p className="text-xs font-semibold text-emerald-600 animate-fade-in flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Correct! Opening your surprise now...</span>
            </p>
          )}
        </div>

        {/* On-Screen Tactile Keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[270px] mx-auto mb-4">
          {digits.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              disabled={isUnlocked}
              className="h-12 rounded-2xl glass-panel-subtle hover:bg-white/80 active:scale-95 font-serif-romantic text-xl font-bold text-slate-800 hover:text-pink-600 transition-all cursor-pointer shadow-xs border border-white/70 flex items-center justify-center select-none"
            >
              {num}
            </button>
          ))}

          {/* Clear / Reset Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isUnlocked || enteredCode.length === 0}
            className="h-12 rounded-2xl glass-panel-subtle hover:bg-white/80 active:scale-95 text-xs font-bold text-slate-600 hover:text-pink-700 transition-all cursor-pointer shadow-xs border border-white/70 flex items-center justify-center disabled:opacity-40 disabled:cursor-default select-none"
            title="Clear entered digits"
          >
            Clear
          </button>

          {/* Zero (0) */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={isUnlocked}
            className="h-12 rounded-2xl glass-panel-subtle hover:bg-white/80 active:scale-95 font-serif-romantic text-xl font-bold text-slate-800 hover:text-pink-600 transition-all cursor-pointer shadow-xs border border-white/70 flex items-center justify-center select-none"
          >
            0
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUnlocked || enteredCode.length === 0}
            className="h-12 rounded-2xl glass-panel-subtle hover:bg-white/80 active:scale-95 text-slate-700 hover:text-rose-600 transition-all cursor-pointer shadow-xs border border-white/70 flex items-center justify-center disabled:opacity-40 disabled:cursor-default select-none"
            title="Delete last digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Helpful Hint Section & Master Unlock */}
        <div className="pt-2 border-t border-pink-200/50 flex flex-col items-center gap-2">
          {showHint ? (
            <div className="glass-panel-subtle p-3 rounded-2xl border border-pink-300/70 text-xs text-rose-900 animate-fade-in w-full text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-600 uppercase tracking-wide mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Sweet Secret Clue</span>
              </div>
              <p className="font-handwriting text-lg text-slate-800 leading-snug">
                &ldquo;{hint}&rdquo;
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-xs font-semibold text-pink-700 hover:text-pink-900 transition-colors flex items-center gap-1 cursor-pointer py-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need a hint? Tap here 💡</span>
            </button>
          )}

          {/* Master Key bypass button so user never gets stuck */}
          <button
            type="button"
            onClick={triggerSuccess}
            className="text-[11px] font-medium text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer hover:underline mt-1"
            title="Instant love bypass for recipient"
          >
            <KeyRound className="w-3 h-3 text-pink-500" />
            <span>Unlock with Love Key (Bypass)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
