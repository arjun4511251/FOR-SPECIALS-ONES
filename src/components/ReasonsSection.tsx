import React, { useState } from 'react';
import { ReasonItem } from '../types/scrapbook';
import { Heart, Sparkles, Smile, Coffee, Star, Flower2, CheckCircle, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScrollFadeUp } from '../hooks/useScrollAnimation';

interface ReasonsSectionProps {
  reasons: ReasonItem[];
  onAddReason?: (reason: ReasonItem) => void;
  onEditReasons?: () => void;
}

export const ReasonsSection: React.FC<ReasonsSectionProps> = ({
  reasons,
}) => {
  const [openedReasons, setOpenedReasons] = useState<Record<string, boolean>>({});

  const getStickerIcon = (type: ReasonItem['sticker']) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'flower':
        return <Flower2 className="w-5 h-5 text-pink-500" />;
      case 'sparkle':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-rose-400" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-400 fill-amber-400" />;
      case 'smile':
      default:
        return <Smile className="w-5 h-5 text-pink-500" />;
    }
  };

  const handleCardClick = (id: string) => {
    setOpenedReasons((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const totalOpened = Object.values(next).filter(Boolean).length;
      if (totalOpened === reasons.length && !prev[id]) {
        // Trigger sweet celebration confetti
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#f43f68', '#fbcfe8', '#f472b6', '#fed7aa'],
          });
        } catch {
          // fallback
        }
      }
      return next;
    });
  };

  const handleRevealAll = () => {
    const all: Record<string, boolean> = {};
    reasons.forEach((r) => {
      all[r.id] = true;
    });
    setOpenedReasons(all);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#f43f68', '#fbcfe8', '#f472b6'],
      });
    } catch {}
  };

  const openedCount = reasons.filter((r) => openedReasons[r.id]).length;

  return (
    <section id="reasons" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      {/* Scroll-Triggered Header via IntersectionObserver */}
      <ScrollFadeUp distance={24} delay={0} className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2">
          <span>Little Things I Adore</span>
          <span aria-hidden="true">·</span>
          <span>
            Discovered: {openedCount} / {reasons.length}
          </span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Reasons Why I Love You
        </h2>
        <p className="font-handwriting text-xl text-pink-600 mt-1">
          Tap each note to reveal the sweet reason
        </p>
      </ScrollFadeUp>

      {/* Grid of Reasons with Staggered IntersectionObserver Reveal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reasons.map((reason, idx) => {
          const isOpen = !!openedReasons[reason.id];
          const tapeType = idx % 2 === 0 ? 'washi-tape-pink' : 'washi-tape-gold';

          return (
            <ScrollFadeUp
              key={reason.id}
              staggerIndex={idx % 6}
              staggerInterval={75}
              distance={22}
              scale={0.96}
              className="h-full"
            >
              <div
                onClick={() => handleCardClick(reason.id)}
                className="group relative cursor-pointer min-h-[200px] flex flex-col transition-all duration-300 hover:-translate-y-1 h-full"
              >
                {/* Top Washi Tape */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 ${tapeType} w-24 h-5 rounded-xs z-10`}
                ></div>

                <div
                  className={`flex-1 p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                    isOpen
                      ? 'glass-panel shadow-xl border-white/70 scrapbook-paper'
                      : 'glass-panel-subtle hover:bg-white/60 border-white/60 shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-full glass-panel-subtle flex items-center justify-center text-xs font-bold text-pink-700 shadow-xs border border-white/60">
                        #{reason.number}
                      </span>
                      <div className="p-1.5 rounded-full glass-panel-subtle shadow-xs border border-white/60">
                        {getStickerIcon(reason.sticker)}
                      </div>
                    </div>

                    <h3 className="font-serif-romantic text-lg font-bold text-slate-800 mb-2">
                      {reason.title}
                    </h3>

                    {isOpen ? (
                      <p className="text-sm text-slate-700 leading-relaxed font-sans animate-fade-in">
                        {reason.description}
                      </p>
                    ) : (
                      <p className="text-xs text-pink-600 font-handwriting text-lg flex items-center gap-1 mt-2">
                        <span>Tap to read why...</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-pink-200/50 text-xs text-pink-700 mt-4">
                    <span className="font-medium">
                      {isOpen ? 'Revealed 💕' : 'Secret note'}
                    </span>
                    <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300 text-pink-500" />
                  </div>
                </div>
              </div>
            </ScrollFadeUp>
          );
        })}
      </div>

      {/* Control Buttons with Glassmorphism */}
      <ScrollFadeUp distance={18} delay={100} className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {openedCount < reasons.length ? (
          <button
            onClick={handleRevealAll}
            className="px-5 py-2.5 rounded-2xl glass-button text-pink-800 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <CheckCircle className="w-4 h-4 text-pink-600" />
            <span>Reveal All Reasons</span>
          </button>
        ) : (
          <div className="text-xs font-medium text-pink-700 flex items-center gap-2 glass-panel-subtle px-5 py-2.5 rounded-2xl border border-white/70 shadow-md">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>All {reasons.length} reasons unlocked! Every single one is true.</span>
          </div>
        )}
      </ScrollFadeUp>
    </section>
  );
};
