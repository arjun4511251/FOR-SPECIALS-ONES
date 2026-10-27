import React, { useState, useEffect } from 'react';
import { ScrapbookConfig } from '../types/scrapbook';
import { fetchGiftById, FetchGiftResult, getSavedEditSession } from '../utils/giftStorage';
import { formatExpirationDisplay } from '../utils/expiration';
import { romanticAudio } from '../utils/audioPlayer';
import { OpeningScreen } from './OpeningScreen';
import { SecretLockScreen } from './SecretLockScreen';
import { CatRejectScreen } from './CatRejectScreen';
import { ScrapbookHeader } from './ScrapbookHeader';
import { ScrapbookHero } from './ScrapbookHero';
import { PhotoGallerySection } from './PhotoGallerySection';
import { MemoriesSection } from './MemoriesSection';
import { LoveLetterSection } from './LoveLetterSection';
import { ReasonsSection } from './ReasonsSection';
import { SurpriseSection } from './SurpriseSection';
import { MusicController } from './MusicController';
import { FloatingDecorations } from './FloatingDecorations';
import { AnimatedRomanticBackground } from './AnimatedRomanticBackground';
import { ScrollProgressBar } from './ScrollProgressBar';
import confetti from 'canvas-confetti';
import { Heart, ArrowUp, Lock, Sparkles, Home, Clock, RefreshCw } from 'lucide-react';

interface RecipientViewProps {
  giftId: string;
}

export const RecipientView: React.FC<RecipientViewProps> = ({ giftId }) => {
  const [loading, setLoading] = useState(true);
  const [giftResult, setGiftResult] = useState<FetchGiftResult | null>(null);
  const [screen, setScreen] = useState<'question' | 'locked' | 'rejected' | 'scrapbook'>('question');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetchGiftById(giftId);
      if (isMounted) {
        setGiftResult(res);
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [giftId]);

  const gift: ScrapbookConfig | undefined = giftResult?.gift;

  // Sync audio if gift loads
  useEffect(() => {
    if (!gift) return;
    if (gift.audioConfig?.soundtrackType === 'custom-url' && gift.audioConfig.customUrl) {
      romanticAudio.setCustomUrl(gift.audioConfig.customUrl);
    } else {
      romanticAudio.setCustomUrl(null);
    }
    romanticAudio.setVolume(gift.audioConfig?.volume || 0.65);
  }, [gift]);

  const handleYes = () => {
    if (gift?.secretLockConfig?.enabled !== false) {
      setScreen('locked');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    handleUnlock();
  };

  const handleUnlock = () => {
    setScreen('scrapbook');
    romanticAudio.play();

    try {
      confetti({
        particleCount: 90,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#f43f68', '#fbcfe8', '#f472b6', '#ffd166', '#fed7aa'],
      });
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNo = () => {
    setScreen('rejected');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center animate-pulse">
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-bounce" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-spin" />
        </div>
        <h2 className="text-2xl font-serif-romantic font-bold text-slate-800 tracking-tight">
          Unwrapping Your Surprise...
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Checking your digital gift link and preparing memories made with love.
        </p>
      </div>
    );
  }

  // 2. Expired State (No private scrapbook content or photos exposed)
  if (giftResult?.status === 'expired') {
    const session = getSavedEditSession();
    const isOwner = Boolean(giftResult.isOwner || (session && session.id === giftId));

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Soft floating background particles */}
        <FloatingDecorations enabled={true} />

        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-pink-200/80 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-100 to-amber-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <span className="absolute -bottom-1 -right-1 text-sm">🌸</span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 bg-pink-100/70 px-2.5 py-0.5 rounded-full inline-block">
              Availability Expired
            </span>
            <h2 className="text-2xl font-serif-romantic font-bold text-slate-800">
              This Gift Link Has Expired
            </h2>
            {giftResult.recipientName && (
              <p className="text-xs font-semibold text-pink-700">
                Created for {giftResult.recipientName}
              </p>
            )}
            <p className="text-sm text-slate-500 leading-relaxed pt-1">
              {giftResult.message || 'This personalized digital scrapbook reached its expiration date. The creator can extend its availability or publish a new gift link.'}
            </p>
          </div>

          {giftResult.expiredAt && (
            <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-200/50 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Expired on: </span>
              <span>{formatExpirationDisplay(giftResult.expiredAt)}</span>
            </div>
          )}

          {/* Owner quick extension action if creator is viewing */}
          {isOwner && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-300 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900">
                <RefreshCw className="w-3.5 h-3.5 text-pink-600" />
                <span>You created this gift</span>
              </div>
              <p className="text-xs text-pink-800 leading-relaxed">
                Your photos and memories are saved safely. You can reactivate this link anytime in Creator Studio.
              </p>
              <a
                href="/"
                className="w-full py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold text-center block transition-colors shadow-xs"
              >
                Open Creator Studio to Renew Link
              </a>
            </div>
          )}

          <div className="pt-2 border-t border-pink-100 space-y-2">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-md shadow-pink-500/20 hover:opacity-95 transition-opacity text-sm"
            >
              <Home className="w-4 h-4" />
              <span>Create Your Own Digital Gift</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Not Found State
  if (!gift || giftResult?.status === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-pink-200/80 rounded-3xl p-8 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif-romantic font-bold text-slate-800">
              Gift Surprise Not Found
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We couldn’t find this scrapbook link. It may have expired, or the link might have a small typo.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-md shadow-pink-500/20 hover:opacity-95 transition-opacity"
          >
            <Home className="w-4 h-4" />
            <span>Create a New Scrapbook Gift</span>
          </a>
        </div>
      </div>
    );
  }

  // 4. Active Scrapbook Experience
  return (
    <div className="min-h-screen relative text-slate-800">
      {/* Animated Romantic Background */}
      <AnimatedRomanticBackground
        customMediaType={gift.backgroundConfig?.type}
        customMediaUrl={gift.backgroundConfig?.url}
        enableOverlayEffects={gift.backgroundConfig?.enableOverlayEffects}
      />

      {/* 1. Opening Question */}
      {screen === 'question' && (
        <OpeningScreen
          question={gift.openingQuestion}
          recipientName={gift.recipientName}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}

      {/* 2. Secret Lock Screen */}
      {screen === 'locked' && (
        <SecretLockScreen
          passcode={gift.secretLockConfig?.passcode}
          hint={gift.secretLockConfig?.hint}
          title={gift.secretLockConfig?.title}
          subtitle={gift.secretLockConfig?.subtitle}
          recipientName={gift.recipientName}
          senderName={gift.senderName}
          onUnlock={handleUnlock}
          onBack={() => setScreen('question')}
        />
      )}

      {/* 3. Cat Rejection Screen */}
      {screen === 'rejected' && (
        <CatRejectScreen
          onRetry={() => setScreen('question')}
          onAcceptSurprise={handleYes}
        />
      )}

      {/* 4. Full Scrapbook Experience */}
      {screen === 'scrapbook' && (
        <div className="relative">
          <ScrollProgressBar />
          <FloatingDecorations enabled={gift.backgroundConfig?.enableOverlayEffects ?? true} />

          {/* Clean Recipient Top Bar Header (NO Customize or Guide buttons) */}
          <ScrapbookHeader
            recipientName={gift.recipientName}
            onLock={gift.secretLockConfig?.enabled !== false ? () => setScreen('locked') : undefined}
          />

          {/* Main Scrapbook Content */}
          <main className="relative z-10 pb-24">
            <ScrapbookHero
              recipientName={gift.recipientName}
              senderName={gift.senderName}
              romanticKicker={gift.romanticKicker}
              headline={gift.heroHeadline}
              subtext={gift.heroSubtext}
              birthdayDate={gift.birthdayDate}
            />

            <PhotoGallerySection photos={gift.photos} />

            <MemoriesSection memories={gift.memories} />

            <LoveLetterSection
              loveLetter={gift.loveLetter}
              senderName={gift.senderName}
            />

            <ReasonsSection reasons={gift.reasons} />

            <SurpriseSection
              surprise={gift.finalSurprise}
              recipientName={gift.recipientName}
              senderName={gift.senderName}
            />
          </main>

          {/* Floating Audio Controller */}
          <MusicController trackTitle={gift.audioConfig?.title} />

          {/* Clean Recipient Footer (NO edit buttons) */}
          <footer className="border-t border-white/60 bg-white/30 backdrop-blur-xl py-8 px-4 text-center relative z-10 text-xs text-slate-700 shadow-xs">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 font-handwriting text-2xl text-pink-700">
                <span>Made with endless love by {gift.senderName || 'Alex'} for {gift.recipientName || 'Sarah'}</span>
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500 inline" />
              </div>

              <div className="flex items-center gap-3">
                {gift.secretLockConfig?.enabled !== false && (
                  <button
                    onClick={() => setScreen('locked')}
                    className="px-3 py-1.5 rounded-xl glass-button text-slate-700 hover:text-pink-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Lock scrapbook vault"
                  >
                    <Lock className="w-3.5 h-3.5 text-pink-600" />
                    <span>Lock Vault</span>
                  </button>
                )}
                <button
                  onClick={scrollToTop}
                  className="p-2 rounded-xl glass-button text-pink-700 hover:text-pink-900 transition-colors cursor-pointer flex items-center gap-1"
                  title="Scroll to top"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Top</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};
