import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface OpeningScreenProps {
  question: string;
  recipientName: string;
  onYes: () => void;
  onNo: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  question,
  recipientName,
  onYes,
  onNo,
}) => {
  const [noHoverCount, setNoHoverCount] = useState(0);

  const handleNoMouseEnter = () => {
    setNoHoverCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-black/35 via-black/20 to-black/40 backdrop-blur-[1px]">
      {/* Background Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-300/40 animate-float-slow select-none"
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 23) % 92}%`,
              animationDelay: `${(i % 5) * 0.7}s`,
              fontSize: `${16 + (i % 4) * 8}px`,
            }}
          >
            {i % 2 === 0 ? '🌸' : '💖'}
          </div>
        ))}
      </div>

      {/* Center Romantic Glass Card */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 text-center">
        {/* Cute Top Washi Tape */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape-pink w-32 h-7 rounded-sm rotate-1 shadow-sm"></div>

        {/* Small greeting kicker */}
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-pink-700 mb-3 glass-panel-subtle px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>A special delivery for {recipientName || 'You'}</span>
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
        </div>

        {/* Animated Main Prompt */}
        <h1 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3 text-balance leading-snug drop-shadow-xs">
          {question || 'Do you want a surprise?'}
        </h1>

        <p className="font-handwriting text-2xl text-pink-800 mb-8 tracking-wide drop-shadow-xs">
          A little digital scrapbook made just for your birthday...
        </p>

        {/* Interactive YES & NO buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* YES Button */}
          <button
            onClick={onYes}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-button-primary text-white font-semibold text-base active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>YES, Please! 💕</span>
          </button>

          {/* NO Button */}
          <button
            onClick={onNo}
            onMouseEnter={handleNoMouseEnter}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-button text-slate-700 hover:text-pink-700 font-semibold text-base transition-all duration-200 cursor-pointer ${
              noHoverCount > 0 ? 'hover:scale-95' : ''
            }`}
          >
            <span>No, maybe later 🙈</span>
          </button>
        </div>

        {noHoverCount > 1 && (
          <p className="mt-4 text-xs text-pink-500 font-handwriting text-lg animate-fade-in">
            (Pst... I wouldn&apos;t click &quot;No&quot; if I were you! 🐱)
          </p>
        )}
      </div>
    </div>
  );
};
