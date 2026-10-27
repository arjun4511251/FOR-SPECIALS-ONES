import React, { useState } from 'react';
import { Gift, Sparkles, Heart, Copy, Check, RotateCcw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScrollFadeUp } from '../hooks/useScrollAnimation';

interface SurpriseSectionProps {
  surprise: {
    cakeTitle: string;
    cakeMessage: string;
    couponTitle: string;
    couponSubtitle: string;
    couponDetails: string;
    couponCode: string;
    personalPromise: string;
  };
  recipientName: string;
  senderName: string;
}

export const SurpriseSection: React.FC<SurpriseSectionProps> = ({
  surprise,
  recipientName,
  senderName,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenGift = () => {
    setIsOpened(true);
    // Burst multi-stage confetti
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#f43f68', '#ec4899', '#fb7185'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#ffd166', '#f43f68', '#fbcfe8'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#ffb703', '#fb7185', '#ffffff'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // fallback
    }
  };

  const handleBlowCandles = () => {
    setCandlesBlown(true);
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fb7185', '#fed7aa', '#f43f68'],
      });
    } catch {}
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      `${surprise.couponCode}: ${surprise.couponTitle} - Redeemable with ${senderName}!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="surprise" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-20">
      {/* Scroll-Triggered Header via IntersectionObserver */}
      <ScrollFadeUp distance={24} delay={0} className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2">
          <span>The Grand Finale</span>
          <span aria-hidden="true">·</span>
          <span>Prepared with all my heart</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          Your Birthday Surprise
        </h2>
        <p className="font-handwriting text-2xl text-pink-600 mt-1">
          One more special gift just for you, {recipientName || 'my love'}
        </p>
      </ScrollFadeUp>

      {/* Gift Box Unopened State with Glassmorphism via IntersectionObserver */}
      {!isOpened ? (
        <ScrollFadeUp distance={22} delay={60} scale={0.97} className="max-w-lg mx-auto text-center">
          <div
            onClick={handleOpenGift}
            className="group relative cursor-pointer glass-panel rounded-3xl p-10 sm:p-14 shadow-2xl border border-white/70 bg-gradient-to-br from-white/70 via-pink-100/50 to-rose-200/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
          >
            {/* Washi tapes */}
            <div className="absolute -top-3 left-10 washi-tape-gold w-24 h-6 rotate-2 rounded-xs"></div>
            <div className="absolute -top-3 right-10 washi-tape-pink w-24 h-6 -rotate-2 rounded-xs"></div>

            {/* Ribbon crossing illustration */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-rose-400/20 border-y border-rose-300/40 pointer-events-none"></div>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-rose-400/20 border-x border-rose-300/40 pointer-events-none"></div>

            {/* Giant Gift Icon with bounce */}
            <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-rose-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-6 border border-white/50">
              <Gift className="w-12 h-12" />
            </div>

            <div className="relative z-10">
              <div className="inline-block glass-panel-subtle px-4 py-1.5 rounded-full text-xs font-semibold text-rose-700 mb-3 border border-white/70 shadow-xs">
                To: {recipientName || 'Birthday Queen'} 🎀
              </div>

              <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Tap to Unwrap Your Gift
              </h3>
              <p className="font-handwriting text-xl text-rose-700 mb-6">
                &quot;I wonder what is inside...&quot;
              </p>

              <button
                type="button"
                className="glass-button-primary px-8 py-3.5 rounded-2xl font-medium text-base shadow-xl shadow-rose-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Open The Surprise Box! ✨</span>
              </button>
            </div>
          </div>
        </ScrollFadeUp>
      ) : (
        /* Opened Surprise Container with Glassmorphism */
        <div className="space-y-12 animate-fade-in">
          {/* Cake & Candle Wish Card via IntersectionObserver */}
          <ScrollFadeUp distance={22} delay={60} scale={0.98}>
            <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/70 scrapbook-paper relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Cake Image with Candle Animation */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-white/40 border border-white/60 shadow-md">
                  <img
                    src="/src/assets/images/birthday_surprise_cake_1792606781095.jpg"
                    alt="Birthday cake with candles"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {/* Candles Status Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 glass-panel-subtle p-3 rounded-2xl border border-white/70 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2">
                      <Flame
                        className={`w-5 h-5 transition-colors ${
                          candlesBlown ? 'text-slate-400' : 'text-amber-500 animate-pulse fill-amber-400'
                        }`}
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {candlesBlown ? '✨ Wish made! The universe heard you.' : '🔥 Candles are lit & glowing'}
                      </span>
                    </div>

                    <button
                      onClick={handleBlowCandles}
                      disabled={candlesBlown}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        candlesBlown
                          ? 'bg-slate-200/70 text-slate-400 cursor-default'
                          : 'glass-button-primary'
                      }`}
                    >
                      {candlesBlown ? 'Blown out' : 'Blow Candles 🎂'}
                    </button>
                  </div>
                </div>

                {/* Cake Message */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-pink-700 mb-2">
                    <Heart className="w-4 h-4 fill-pink-500" />
                    <span>Birthday Wish Time</span>
                  </div>
                  <h3 className="font-serif-romantic text-3xl font-bold text-slate-900 mb-3">
                    {surprise.cakeTitle}
                  </h3>
                  <p className="text-slate-700 text-base leading-relaxed mb-6 font-sans">
                    {surprise.cakeMessage}
                  </p>

                  <div className="p-4 rounded-2xl glass-panel-subtle border border-white/60">
                    <p className="font-handwriting text-2xl text-pink-700 leading-snug">
                      &ldquo;{surprise.personalPromise}&rdquo;
                    </p>
                    <p className="text-xs font-serif-romantic font-bold text-slate-700 mt-2 text-right">
                      — {senderName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollFadeUp>

          {/* Birthday Love Coupon / Pass with Frosted Glass Overlay via IntersectionObserver */}
          <ScrollFadeUp distance={22} delay={120} scale={0.98}>
            <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-white/60 bg-gradient-to-br from-rose-500/90 via-pink-500/85 to-rose-600/90 backdrop-blur-xl text-white">
              {/* Cutout notch decorations on sides */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40"></div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40"></div>

              <div className="border-2 border-dashed border-white/50 rounded-2xl p-6 sm:p-8 text-center relative">
                <div className="text-xs uppercase tracking-widest text-pink-100 font-semibold mb-2">
                  Official Birthday Pass
                </div>

                <h4 className="font-serif-romantic text-2xl sm:text-3xl font-bold mb-2">
                  {surprise.couponTitle}
                </h4>

                <p className="font-handwriting text-xl text-pink-100 mb-4">
                  {surprise.couponSubtitle}
                </p>

                <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-4 my-5 text-sm sm:text-base text-pink-50 leading-relaxed max-w-lg mx-auto border border-white/20">
                  {surprise.couponDetails}
                </div>

                {/* Code Box */}
                <div className="inline-flex items-center gap-3 bg-white/95 text-rose-600 px-5 py-2.5 rounded-2xl shadow-lg font-mono text-sm font-bold border border-white/80">
                  <span>{surprise.couponCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Copy pass details"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {copied && (
                  <p className="text-xs text-pink-100 mt-2 font-medium">
                    Copied voucher to clipboard! Ready to show {senderName}.
                  </p>
                )}
              </div>
            </div>
          </ScrollFadeUp>

          {/* Rewrap Action with Glass Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setIsOpened(false);
                setCandlesBlown(false);
              }}
              className="px-5 py-2.5 rounded-2xl text-xs font-medium text-slate-700 glass-button inline-flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-pink-600" />
              <span>Wrap the surprise gift back up</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
