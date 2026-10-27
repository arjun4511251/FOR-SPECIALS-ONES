import React from 'react';
import { RotateCcw, Heart, Sparkles } from 'lucide-react';
import { CAT_IMAGE_URL } from '../data/defaultScrapbook';

interface CatRejectScreenProps {
  onRetry: () => void;
  onAcceptSurprise: () => void;
}

export const CatRejectScreen: React.FC<CatRejectScreenProps> = ({
  onRetry,
  onAcceptSurprise,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-black/35 via-black/20 to-black/40 backdrop-blur-[1px]">
      {/* Gentle Floating Paws / Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-300/50 animate-float-slow select-none text-xl"
            style={{
              top: `${(i * 17) % 90}%`,
              left: `${(i * 29) % 90}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {i % 2 === 0 ? '🐾' : '💔'}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 text-center">
        {/* Top Washi Tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape-gold w-28 h-6 rounded-sm -rotate-2 shadow-sm"></div>

        {/* Cute Cat Glass Polaroid Frame */}
        <div className="glass-panel-subtle p-3 pb-5 rounded-2xl shadow-md mb-5 transform -rotate-1 hover:rotate-0 transition-transform">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-pink-900/10">
            <img
              src={CAT_IMAGE_URL}
              alt="Sad pleading fluffy kitten begging for a second chance"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="font-handwriting text-2xl text-slate-800 mt-3 font-semibold">
            &quot;Please reconsider? I prepared so many cute memories!&quot; 🥺
          </p>
        </div>

        {/* Headline */}
        <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-rose-600 mb-2 drop-shadow-xs">
          Nooo! Try again
        </h2>

        <p className="text-sm sm:text-base text-slate-800 mb-6 max-w-xs mx-auto leading-relaxed font-medium">
          How could you say no to that little fluffy face? The birthday surprise is waiting for you!
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onAcceptSurprise}
            className="w-full py-3.5 px-6 rounded-2xl glass-button-primary text-white font-semibold text-base active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Okay, show me the surprise! 💕</span>
          </button>

          <button
            onClick={onRetry}
            className="w-full py-2.5 px-4 rounded-xl glass-button text-slate-700 hover:text-pink-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Go back to the question</span>
          </button>
        </div>
      </div>
    </div>
  );
};
