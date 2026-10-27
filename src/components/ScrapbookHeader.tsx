import React from 'react';
import { Sliders, HelpCircle, Lock } from 'lucide-react';

interface ScrapbookHeaderProps {
  recipientName: string;
  onOpenCustomize?: () => void;
  onOpenGuide?: () => void;
  onLock?: () => void;
}

export const ScrapbookHeader: React.FC<ScrapbookHeaderProps> = ({
  recipientName,
  onOpenCustomize,
  onOpenGuide,
  onLock,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          className="font-serif-romantic text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-pink-600 transition-colors flex items-center gap-2 drop-shadow-xs"
        >
          <span>{recipientName ? `${recipientName}'s Scrapbook` : 'Birthday Scrapbook'}</span>
          <span className="text-pink-500 font-normal text-sm">✨</span>
        </a>

        {/* Zone 2: Single-line Text Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-800">
          <a
            href="#polaroids"
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
          >
            Polaroids
          </a>
          <a
            href="#memories"
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
          >
            Memories
          </a>
          <a
            href="#love-letter"
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
          >
            Love Letter
          </a>
          <a
            href="#reasons"
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
          >
            Reasons Why
          </a>
          <a
            href="#surprise"
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0"
          >
            Surprise Gift
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onLock && (
            <button
              onClick={onLock}
              title="Lock with secret code"
              className="px-3 py-2 text-xs font-semibold text-pink-700 hover:text-pink-900 glass-button rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              title="Publishing & Sharing Guide"
              className="p-2 text-slate-700 hover:text-pink-600 glass-button rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          {onOpenCustomize && (
            <button
              onClick={onOpenCustomize}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white glass-button-primary rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Customize</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
