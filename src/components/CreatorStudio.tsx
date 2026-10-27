import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrapbookConfig, PhotoItem, MemoryItem, ReasonItem } from '../types/scrapbook';
import { DEFAULT_SCRAPBOOK } from '../data/defaultScrapbook';
import {
  saveLocalDraft,
  loadLocalDraft,
  getSavedEditSession,
  saveEditSession,
  clearEditSession,
  fetchGiftById,
} from '../utils/giftStorage';
import { romanticAudio } from '../utils/audioPlayer';
import { CustomizeModal } from './CustomizeModal';
import { PublishModal } from './PublishModal';
import { PublishGuideModal } from './PublishGuideModal';
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
import {
  Sparkles,
  Share2,
  Smartphone,
  Monitor,
  Eye,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowUp,
  Heart,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { isGiftExpired, getRemainingTimeText } from '../utils/expiration';

export const CreatorStudio: React.FC = () => {
  // Load initial draft from persistent local storage or default
  const [config, setConfig] = useState<ScrapbookConfig>(() => loadLocalDraft());
  const [editSession, setEditSession] = useState<{ id: string; editToken: string; expiresAt?: string | null } | null>(() =>
    getSavedEditSession()
  );

  // Studio UI states
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewScreen, setPreviewScreen] = useState<'question' | 'locked' | 'rejected' | 'scrapbook'>('scrapbook');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [isAutosaving, setIsAutosaving] = useState(false);

  // Autosave draft whenever config changes
  useEffect(() => {
    setIsAutosaving(true);
    saveLocalDraft(config);
    const timer = setTimeout(() => {
      setIsAutosaving(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 400);
    return () => clearTimeout(timer);
  }, [config]);

  // Audio settings sync for preview
  useEffect(() => {
    if (config.audioConfig?.soundtrackType === 'custom-url' && config.audioConfig.customUrl) {
      romanticAudio.setCustomUrl(config.audioConfig.customUrl);
    } else {
      romanticAudio.setCustomUrl(null);
    }
    romanticAudio.setVolume(config.audioConfig?.volume || 0.65);
  }, [config.audioConfig]);

  const handleConfigChange = useCallback((updated: ScrapbookConfig) => {
    setConfig(updated);
  }, []);

  const handleResetToDefault = () => {
    if (window.confirm('Reset all scrapbook settings back to the original romantic sample?')) {
      setConfig(DEFAULT_SCRAPBOOK);
      saveLocalDraft(DEFAULT_SCRAPBOOK);
      clearEditSession();
      setEditSession(null);
    }
  };

  // Sync live expiration status from backend for the owner
  useEffect(() => {
    if (!editSession?.id || !editSession?.editToken) return;
    let isMounted = true;
    fetchGiftById(editSession.id, editSession.editToken)
      .then((res) => {
        if (isMounted && res.status === 'ok' && res.expiresAt !== undefined) {
          setEditSession((prev) => prev ? { ...prev, expiresAt: res.expiresAt } : null);
          saveEditSession(editSession.id, editSession.editToken, res.expiresAt);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [editSession?.id, editSession?.editToken]);

  const handlePublishedSuccess = (giftId: string, editToken: string, expiresAt?: string | null) => {
    setEditSession({ id: giftId, editToken, expiresAt });
    saveEditSession(giftId, editToken, expiresAt);
  };

  // Preview interactive handlers
  const handlePreviewYes = () => {
    if (config.secretLockConfig?.enabled !== false) {
      setPreviewScreen('locked');
      return;
    }
    handlePreviewUnlock();
  };

  const handlePreviewUnlock = () => {
    setPreviewScreen('scrapbook');
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f68', '#fbcfe8', '#f472b6', '#ffd166'],
      });
    } catch {}
  };

  const handlePreviewNo = () => {
    setPreviewScreen('rejected');
  };

  const scrollToPreviewTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 flex flex-col">
      {/* 1. TOP CREATOR STUDIO NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Mode */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-pink-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-romantic text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Romantic Scrapbook Creator
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Studio
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAutosaving ? 'Saving changes...' : `Draft saved (${lastSaved})`}</span>
                </span>
                {editSession && (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => setIsPublishModalOpen(true)}
                      className="hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                      title="Manage publication link and expiration"
                    >
                      <Clock className="w-3.5 h-3.5 text-pink-500" />
                      <span className={isGiftExpired(editSession.expiresAt) ? "text-amber-600 font-semibold" : "text-pink-600 font-medium"}>
                        {editSession.expiresAt
                          ? isGiftExpired(editSession.expiresAt)
                            ? 'Link Expired · Renew'
                            : `Active · ${getRemainingTimeText(editSession.expiresAt)}`
                          : `Linked: ${editSession.id}`}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: View toggles & Publish Button */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher (Editor / Preview) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'editor' ? 'bg-white text-pink-600 font-semibold shadow-2xs' : 'hover:text-slate-900'
                }`}
                title="Editor Mode"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'preview' ? 'bg-white text-pink-600 font-semibold shadow-2xs' : 'hover:text-slate-900'
                }`}
                title="Live Preview Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Help Guide */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors cursor-pointer"
              title="Publishing & Sharing Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Primary Action: Publish & Share */}
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Publish &amp; Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        {/* CUSTOMIZATION EDITOR */}
        {viewMode === 'editor' && (
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto max-w-4xl mx-auto w-full">
            <CustomizeModal
              config={config}
              isOpen={true}
              embedded={true}
              onClose={() => {}}
              onSave={handleConfigChange}
              onReset={handleResetToDefault}
              onConfigChange={handleConfigChange}
              onOpenPublish={() => setIsPublishModalOpen(true)}
              activePublishedId={editSession?.id}
            />
          </div>
        )}

        {/* LIVE PREVIEW PANE */}
        {viewMode === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-pink-50/50 via-rose-50/40 to-purple-50/50 w-full">
            {/* Live Preview Control Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200/70 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Preview Stage Switcher */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700 mr-1 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-pink-600" />
                  Preview Step:
                </span>
                <button
                  onClick={() => setPreviewScreen('question')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewScreen === 'question'
                      ? 'bg-pink-500 text-white font-medium shadow-xs'
                      : 'bg-white border border-pink-200 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  1. Question
                </button>
                <button
                  onClick={() => setPreviewScreen('locked')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewScreen === 'locked'
                      ? 'bg-pink-500 text-white font-medium shadow-xs'
                      : 'bg-white border border-pink-200 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  2. Secret Lock
                </button>
                <button
                  onClick={() => setPreviewScreen('rejected')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewScreen === 'rejected'
                      ? 'bg-pink-500 text-white font-medium shadow-xs'
                      : 'bg-white border border-pink-200 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  Reject Cat
                </button>
                <button
                  onClick={() => setPreviewScreen('scrapbook')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewScreen === 'scrapbook'
                      ? 'bg-pink-500 text-white font-medium shadow-xs'
                      : 'bg-white border border-pink-200 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  3. Full Scrapbook
                </button>
              </div>

              {/* Device simulation toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-600">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      previewDevice === 'desktop' ? 'bg-white text-pink-600 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      previewDevice === 'mobile' ? 'bg-white text-pink-600 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                    title="Mobile Device Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setPreviewScreen('question')}
                  className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer flex items-center gap-1"
                  title="Restart recipient experience from beginning"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart Flow</span>
                </button>
              </div>
            </div>

            {/* Live Preview Viewport */}
            <div className="flex-1 overflow-y-auto relative flex items-start justify-center p-2 sm:p-4">
              <div
                className={`transition-all duration-300 w-full ${
                  previewDevice === 'mobile'
                    ? 'max-w-sm rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden bg-white my-4 relative'
                    : 'max-w-5xl rounded-2xl shadow-md overflow-hidden bg-white/70 relative'
                }`}
                style={{ minHeight: previewDevice === 'mobile' ? '750px' : '650px' }}
              >
                {/* Simulated Phone Notch in Mobile Mode */}
                {previewDevice === 'mobile' && (
                  <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                    <div className="w-8 h-1 rounded-full bg-slate-700" />
                  </div>
                )}

                {/* Animated Romantic Background for Preview */}
                <AnimatedRomanticBackground
                  customMediaType={config.backgroundConfig?.type}
                  customMediaUrl={config.backgroundConfig?.url}
                  enableOverlayEffects={config.backgroundConfig?.enableOverlayEffects}
                />

                {/* STAGE 1: Opening Question */}
                {previewScreen === 'question' && (
                  <OpeningScreen
                    question={config.openingQuestion}
                    recipientName={config.recipientName}
                    onYes={handlePreviewYes}
                    onNo={handlePreviewNo}
                  />
                )}

                {/* STAGE 2: Secret Lock */}
                {previewScreen === 'locked' && (
                  <SecretLockScreen
                    passcode={config.secretLockConfig?.passcode}
                    hint={config.secretLockConfig?.hint}
                    title={config.secretLockConfig?.title}
                    subtitle={config.secretLockConfig?.subtitle}
                    recipientName={config.recipientName}
                    senderName={config.senderName}
                    onUnlock={handlePreviewUnlock}
                    onBack={() => setPreviewScreen('question')}
                  />
                )}

                {/* STAGE 3: Cat Rejection */}
                {previewScreen === 'rejected' && (
                  <CatRejectScreen
                    onRetry={() => setPreviewScreen('question')}
                    onAcceptSurprise={handlePreviewYes}
                  />
                )}

                {/* STAGE 4: Full Scrapbook Content */}
                {previewScreen === 'scrapbook' && (
                  <div className="relative text-slate-800">
                    <ScrollProgressBar />
                    <FloatingDecorations enabled={config.backgroundConfig?.enableOverlayEffects ?? true} />

                    {/* Preview Header */}
                    <ScrapbookHeader
                      recipientName={config.recipientName}
                      onLock={config.secretLockConfig?.enabled !== false ? () => setPreviewScreen('locked') : undefined}
                    />

                    {/* Scrapbook Sections */}
                    <main className="relative z-10 pb-20">
                      <ScrapbookHero
                        recipientName={config.recipientName}
                        senderName={config.senderName}
                        romanticKicker={config.romanticKicker}
                        headline={config.heroHeadline}
                        subtext={config.heroSubtext}
                        birthdayDate={config.birthdayDate}
                      />

                      <PhotoGallerySection photos={config.photos} />

                      <MemoriesSection memories={config.memories} />

                      <LoveLetterSection
                        loveLetter={config.loveLetter}
                        senderName={config.senderName}
                      />

                      <ReasonsSection reasons={config.reasons} />

                      <SurpriseSection
                        surprise={config.finalSurprise}
                        recipientName={config.recipientName}
                        senderName={config.senderName}
                      />
                    </main>

                    {/* Floating Music Controller */}
                    <MusicController trackTitle={config.audioConfig?.title} />

                    {/* Romantic Footer */}
                    <footer className="border-t border-white/60 bg-white/30 backdrop-blur-xl py-6 px-4 text-center relative z-10 text-xs text-slate-700">
                      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 font-handwriting text-xl text-pink-700">
                          <span>Made with endless love by {config.senderName || 'Alex'} for {config.recipientName || 'Sarah'}</span>
                          <Heart className="w-4 h-4 fill-pink-500 text-pink-500 inline" />
                        </div>

                        <div className="flex items-center gap-2">
                          {config.secretLockConfig?.enabled !== false && (
                            <button
                              onClick={() => setPreviewScreen('locked')}
                              className="px-2.5 py-1 rounded-lg glass-button text-slate-700 hover:text-pink-700 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3 text-pink-600" />
                              <span>Lock</span>
                            </button>
                          )}
                          <button
                            onClick={scrollToPreviewTop}
                            className="p-1.5 rounded-lg glass-button text-pink-700 hover:text-pink-900 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                            <span>Top</span>
                          </button>
                        </div>
                      </div>
                    </footer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. PUBLISH & SHARE MODAL */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        config={config}
        existingGiftId={editSession?.id}
        existingEditToken={editSession?.editToken}
        onPublishedSuccess={handlePublishedSuccess}
      />

      {/* 4. PUBLISHING GUIDE MODAL */}
      <PublishGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        recipientName={config.recipientName}
      />
    </div>
  );
};
