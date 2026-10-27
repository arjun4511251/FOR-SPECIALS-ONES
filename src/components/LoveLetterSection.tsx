import React, { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';
import { ScrapbookConfig } from '../types/scrapbook';
import { ScrollFadeUp } from '../hooks/useScrollAnimation';

interface LoveLetterSectionProps {
  loveLetter: ScrapbookConfig['loveLetter'];
  senderName: string;
  onEditLetter?: () => void;
  onUpdateLetter?: (updatedLetter: ScrapbookConfig['loveLetter']) => void;
}

const INK_COLORS: Array<{
  id: NonNullable<ScrapbookConfig['loveLetter']['inkColor']>;
  name: string;
  textColor: string;
}> = [
  { id: 'rose', name: 'Romantic Rose', textColor: 'text-rose-950' },
  { id: 'espresso', name: 'Vintage Espresso', textColor: 'text-stone-900' },
  { id: 'wine', name: 'Deep Wine', textColor: 'text-red-950' },
  { id: 'midnight', name: 'Midnight Ink', textColor: 'text-slate-900' },
  { id: 'blush', name: 'Berry Blush', textColor: 'text-pink-950' },
];

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  loveLetter,
  senderName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentFontFamily = loveLetter.fontFamily || 'dancing';
  const currentFontSize = loveLetter.fontSize || 'md';
  const currentInkColor = loveLetter.inkColor || 'rose';
  const waxSealEmoji = loveLetter.waxSealEmoji || '💌';
  const stampEmoji = loveLetter.stampEmoji || '💖';

  const getFontClass = (family: string) => {
    switch (family) {
      case 'parisienne':
        return 'font-parisienne';
      case 'caveat':
        return 'font-caveat';
      case 'marck':
        return 'font-marck';
      case 'courier':
        return 'font-courier';
      case 'playfair':
        return 'font-serif-romantic';
      case 'outfit':
        return 'font-sans';
      case 'dancing':
      default:
        return 'font-dancing';
    }
  };

  const getFontSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          title: 'text-xl sm:text-2xl',
          body: 'text-base sm:text-lg leading-relaxed',
          closing: 'text-xl sm:text-2xl',
          sign: 'text-lg sm:text-xl',
        };
      case 'lg':
        return {
          title: 'text-3xl sm:text-4xl',
          body: 'text-xl sm:text-2xl leading-relaxed',
          closing: 'text-2xl sm:text-3xl',
          sign: 'text-2xl sm:text-3xl',
        };
      case 'xl':
        return {
          title: 'text-3xl sm:text-5xl',
          body: 'text-2xl sm:text-3xl leading-relaxed',
          closing: 'text-3xl sm:text-4xl',
          sign: 'text-2xl sm:text-3xl',
        };
      case 'md':
      default:
        return {
          title: 'text-2xl sm:text-3xl',
          body: 'text-lg sm:text-xl leading-relaxed',
          closing: 'text-2xl sm:text-3xl',
          sign: 'text-xl sm:text-2xl',
        };
    }
  };

  const getInkColorClass = (color: string) => {
    const found = INK_COLORS.find((c) => c.id === color);
    return found ? found.textColor : 'text-rose-950';
  };

  const currentFontClass = getFontClass(currentFontFamily);
  const sizeClasses = getFontSizeClasses(currentFontSize);
  const inkColorClass = getInkColorClass(currentInkColor);

  return (
    <section id="love-letter" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto scroll-mt-20">
      {/* Section Header with Scroll Trigger via IntersectionObserver */}
      <ScrollFadeUp distance={24} delay={0} className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2">
          <span>Sealed With Love</span>
          <span aria-hidden="true">·</span>
          <span>Only for your eyes</span>
          <span className="text-sm">{waxSealEmoji}</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          A Letter For Your Birthday
        </h2>
        <p className={`${currentFontClass} text-xl sm:text-2xl text-pink-600 mt-1`}>
          Words straight from my heart to yours
        </p>
      </ScrollFadeUp>

      {/* Envelope Container with Scroll Trigger via IntersectionObserver */}
      {!isOpen ? (
        <ScrollFadeUp distance={20} delay={60} scale={0.97} className="max-w-md mx-auto text-center">
          <div
            onClick={() => setIsOpen(true)}
            className="group relative cursor-pointer glass-panel rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/70 bg-gradient-to-br from-white/70 via-pink-100/60 to-rose-200/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
          >
            {/* Stamp decoration */}
            <div className="absolute top-4 right-4 glass-panel-subtle p-2 rounded-xl border-2 border-dashed border-rose-300/80 rotate-6 shadow-xs group-hover:rotate-12 transition-transform">
              <div className="w-10 h-11 bg-white/70 rounded-lg flex flex-col items-center justify-center shadow-xs">
                <span className="text-xl leading-none select-none">{stampEmoji}</span>
                <span className="text-[9px] font-mono text-rose-500 font-bold mt-0.5">AIRMAIL</span>
              </div>
            </div>

            {/* Postmark mark */}
            <div className="absolute top-6 right-24 text-[10px] font-mono text-rose-500 rotate-[-12deg] select-none font-semibold">
              SEALED WITH LOVE ★ 2026
            </div>

            {/* Envelope Icon with Wax seal */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform mb-4 border border-white/40">
              <Mail className="w-9 h-9" />
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-rose-700 border-2 border-white/80 shadow-md flex items-center justify-center text-lg animate-pulse-glow">
                {waxSealEmoji}
              </div>
            </div>

            <h3 className="font-serif-romantic text-2xl font-bold text-slate-800 mb-1">
              To the Birthday Girl
            </h3>
            <p className={`${currentFontClass} text-xl text-rose-700 mb-5`}>
              &quot;Tap to break the wax seal &amp; open&quot;
            </p>

            {/* Wax Seal Imitation Button */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600/95 backdrop-blur-xs text-white text-xs font-semibold shadow-lg shadow-rose-700/30 border border-white/40 group-hover:bg-rose-700 group-hover:scale-105 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Break Wax Seal</span>
              <span className="text-base leading-none">{waxSealEmoji}</span>
            </div>
          </div>
        </ScrollFadeUp>
      ) : (
        /* Unfolded Parchment Letter with Glassmorphism */
        <div className="relative glass-panel-deep rounded-3xl p-6 sm:p-12 md:p-14 shadow-2xl border border-white/80 scrapbook-paper transition-all duration-500 animate-fade-in">
          {/* Top Washi Tape */}
          <div className="absolute -top-3 left-12 washi-tape-pink w-32 h-6 -rotate-1 rounded-xs"></div>
          <div className="absolute -top-3 right-12 washi-tape-gold w-32 h-6 rotate-2 rounded-xs"></div>

          {/* Letter Body with Dynamic Romantic Font & Size */}
          <div className="space-y-6 pt-2">
            <h3
              className={`${currentFontClass} ${sizeClasses.title} font-bold ${inkColorClass} tracking-wide transition-all`}
            >
              {loveLetter.salutation}
            </h3>

            <div
              className={`space-y-4 ${currentFontClass} ${sizeClasses.body} ${inkColorClass} transition-all`}
            >
              {loveLetter.paragraphs.map((p, idx) => (
                <p key={idx} className="whitespace-pre-line leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="pt-6 border-t border-pink-200/60 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className={`${currentFontClass} ${sizeClasses.closing} ${inkColorClass} mb-1 transition-all`}>
                  {loveLetter.closing}
                </p>
                <p className={`font-serif-romantic ${sizeClasses.sign} font-bold text-slate-800`}>
                  {senderName}
                </p>
              </div>

              {/* Actions & Wax Seal Signature Badge */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-pink-700/80 hover:text-pink-950 cursor-pointer px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-white/70 transition-colors"
                  title="Fold letter back into envelope"
                >
                  Fold Back ✉️
                </button>

                <div
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl glass-panel-subtle border border-rose-200 text-rose-800 shadow-xs cursor-pointer hover:bg-rose-50/60 transition-colors"
                  title="Authentic Love Seal · Click to fold back"
                >
                  <span className="text-xl">{waxSealEmoji}</span>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                    Authentic Love Seal
                  </span>
                </div>
              </div>
            </div>

            {loveLetter.psNote && (
              <div
                className={`pt-4 ${currentFontClass} text-lg sm:text-xl text-pink-900 glass-panel-subtle p-4 rounded-2xl border border-white/60 shadow-xs flex items-start gap-2.5`}
              >
                <span className="text-xl leading-none mt-0.5">💌</span>
                <div className="flex-1 whitespace-pre-line">
                  {loveLetter.psNote}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
