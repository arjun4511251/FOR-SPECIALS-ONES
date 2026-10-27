import React, { useState, useEffect, useRef } from 'react';
import { ScrapbookConfig, PhotoItem, MemoryItem, ReasonItem } from '../types/scrapbook';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  User,
  Image as ImageIcon,
  Heart,
  BookOpen,
  Gift,
  Plus,
  Trash2,
  Check,
  Film,
  Video,
  Sparkles,
  Type,
  Smile,
  Palette,
  Camera,
  Lock,
  Share2,
} from 'lucide-react';
import { DEFAULT_SCRAPBOOK } from '../data/defaultScrapbook';
import { GIFT_TEMPLATES } from '../data/templates';

interface CustomizeModalProps {
  config: ScrapbookConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ScrapbookConfig) => void;
  onReset: () => void;
  embedded?: boolean;
  onConfigChange?: (updated: ScrapbookConfig) => void;
  onOpenPublish?: () => void;
  activePublishedId?: string;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
  onReset,
  embedded = false,
  onConfigChange,
  onOpenPublish,
  activePublishedId,
}) => {
  const [draft, setDraft] = useState<ScrapbookConfig>(JSON.parse(JSON.stringify(config)));
  const [activeTab, setActiveTab] = useState<'templates' | 'basics' | 'lock' | 'photos' | 'letter' | 'memories' | 'reasons' | 'surprise' | 'background' | 'export'>('basics');
  const [savedNotice, setSavedNotice] = useState(false);
  const [bgPreviewError, setBgPreviewError] = useState<string | null>(null);
  const [emojiTargetField, setEmojiTargetField] = useState<'salutation' | 'p0' | 'p1' | 'p2' | 'closing' | 'psNote'>('p0');
  const [emojiCategory, setEmojiCategory] = useState<'romance' | 'flowers' | 'cute' | 'sparkles'>('romance');

  const lastEmittedRef = useRef<string>(JSON.stringify(config));

  // Sync draft if external config changed (e.g. preset applied or external reset)
  useEffect(() => {
    const configStr = JSON.stringify(config);
    if (configStr !== lastEmittedRef.current) {
      lastEmittedRef.current = configStr;
      setDraft(JSON.parse(configStr));
    }
  }, [config]);

  // Live notify parent of draft updates without creating a feedback loop
  useEffect(() => {
    const draftStr = JSON.stringify(draft);
    if (draftStr !== lastEmittedRef.current) {
      lastEmittedRef.current = draftStr;
      if (onConfigChange) {
        onConfigChange(draft);
      }
    }
  }, [draft, onConfigChange]);

  if (!isOpen && !embedded) return null;

  const handleSave = () => {
    onSave(draft);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all scrapbook contents back to the original romantic sample?')) {
      setDraft(JSON.parse(JSON.stringify(DEFAULT_SCRAPBOOK)));
      onReset();
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draft, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `scrapbook-${draft.recipientName || 'gift'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setDraft(parsed);
          alert('Scrapbook configuration loaded successfully! Remember to click Save.');
        } catch {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Photo handlers
  const updatePhoto = (index: number, key: keyof PhotoItem, value: string | number) => {
    setDraft((prev) => {
      const copy = [...prev.photos];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, photos: copy };
    });
  };

  const addPhotoItem = () => {
    const newP: PhotoItem = {
      id: `photo-${Date.now()}`,
      url: '/src/assets/images/scrapbook_romantic_memory_1792606780386.jpg',
      caption: 'A beautiful day together',
      date: 'Sweet Day',
      note: 'Love this smile so much.',
      rotation: 0,
    };
    setDraft((prev) => ({ ...prev, photos: [...prev.photos, newP] }));
  };

  const deletePhotoItem = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updatePhoto(index, 'url', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Memory handlers
  const updateMemory = (index: number, key: keyof MemoryItem, value: string) => {
    setDraft((prev) => {
      const copy = [...prev.memories];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, memories: copy };
    });
  };

  const handleMemoryPhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateMemory(index, 'photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addMemoryItem = () => {
    const newM: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: 'A lovely moment',
      date: 'Special Time',
      location: 'Our Spot',
      story: 'Tell the story of what happened here...',
      tag: 'Memory',
      photoUrl: '',
    };
    setDraft((prev) => ({ ...prev, memories: [...prev.memories, newM] }));
  };

  const deleteMemoryItem = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      memories: prev.memories.filter((_, i) => i !== index),
    }));
  };

  // Reasons handlers
  const updateReason = (index: number, key: keyof ReasonItem, value: string | number) => {
    setDraft((prev) => {
      const copy = [...prev.reasons];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, reasons: copy };
    });
  };

  const addReasonItem = () => {
    const newR: ReasonItem = {
      id: `reason-${Date.now()}`,
      number: draft.reasons.length + 1,
      title: 'Another thing I adore',
      description: 'Write why you love her for this reason...',
      sticker: 'heart',
    };
    setDraft((prev) => ({ ...prev, reasons: [...prev.reasons, newR] }));
  };

  const deleteReasonItem = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      reasons: prev.reasons.filter((_, i) => i !== index),
    }));
  };

  const handleBgFileUpload = (type: 'image' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size is quite large. Recommended under 50MB for smooth browser playback.');
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setDraft((prev) => ({
            ...prev,
            backgroundConfig: {
              type,
              url: reader.result as string,
              enableOverlayEffects: prev.backgroundConfig?.enableOverlayEffects ?? true,
            },
          }));
          setBgPreviewError(null);
        }
      };
      reader.onerror = () => {
        setBgPreviewError('Failed to read file from device.');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBgConfig = (updates: Partial<NonNullable<ScrapbookConfig['backgroundConfig']>>) => {
    setDraft((prev) => {
      const current = prev.backgroundConfig || { type: 'default', enableOverlayEffects: true };
      const next = {
        ...current,
        ...updates,
      };
      if (updates.type === 'default' || updates.url === '') {
        next.type = 'default';
        next.url = undefined;
      }
      return {
        ...prev,
        backgroundConfig: next,
      };
    });
  };

  const modalInner = (
    <div className={`glass-panel-deep rounded-3xl w-full flex flex-col shadow-2xl border border-white/80 scrapbook-paper relative ${embedded ? 'h-full max-h-none' : 'max-w-3xl max-h-[90vh]'}`}>
      {/* Top Bar */}
      <div className="p-4 sm:p-5 border-b border-pink-200/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif-romantic text-xl sm:text-2xl font-bold text-slate-900">
              {embedded ? 'Scrapbook Personalizer' : 'Customize Scrapbook'}
            </h3>
            {activePublishedId && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">
                Live: {activePublishedId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Personalize names, photos, love letters, reasons, music, and the surprise reveal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPublish && (
            <button
              type="button"
              onClick={onOpenPublish}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Publish &amp; Share</span>
            </button>
          )}

          {!embedded && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-white/60 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation with Glassmorphism */}
      <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-white/40 backdrop-blur-xs border-b border-pink-200/50 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'templates' ? 'glass-panel text-pink-700 shadow-xs font-semibold bg-pink-50/80 border border-pink-300' : 'text-slate-600 hover:text-slate-900 glass-button'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>Presets</span>
        </button>
        <button
          onClick={() => setActiveTab('basics')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'basics' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Names &amp; Cover</span>
        </button>
          <button
            onClick={() => setActiveTab('lock')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lock' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Secret Lock</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'photos' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos ({draft.photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'letter' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Love Letter</span>
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'memories' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Memories ({draft.memories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reasons')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reasons' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Reasons ({draft.reasons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('surprise')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'surprise' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Surprise &amp; Music</span>
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'background' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Background UI</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export' ? 'glass-panel text-pink-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 glass-button'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TEMPLATES PRESETS TAB */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-200/80">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  Choose a Romantic Occasion Preset
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Select a preset below to instantly pre-fill your scrapbook with personalized messages, dates, coupons, and themes. You can still edit every single detail afterward!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {GIFT_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-pink-200/70 hover:border-pink-400 transition-all shadow-xs flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-2xl">{tpl.iconEmoji}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                          {tpl.badge}
                        </span>
                      </div>
                      <h5 className="font-semibold text-slate-800 text-sm">{tpl.name}</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Apply the "${tpl.name}" preset? This will update the scrapbook content.`)) {
                          setDraft(JSON.parse(JSON.stringify(tpl.config)));
                          if (onConfigChange) onConfigChange(tpl.config);
                          setActiveTab('basics');
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-500 text-pink-700 hover:text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      Use This Preset
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BASICS TAB */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Girlfriend&apos;s Name
                  </label>
                  <input
                    type="text"
                    value={draft.recipientName}
                    onChange={(e) => setDraft({ ...draft, recipientName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={draft.senderName}
                    onChange={(e) => setDraft({ ...draft, senderName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nickname / Pet Name
                  </label>
                  <input
                    type="text"
                    value={draft.nickname}
                    onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Birthday Date / Occasion
                  </label>
                  <input
                    type="text"
                    value={draft.birthdayDate}
                    onChange={(e) => setDraft({ ...draft, birthdayDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Opening Screen Question
                </label>
                <input
                  type="text"
                  value={draft.openingQuestion}
                  onChange={(e) => setDraft({ ...draft, openingQuestion: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cover Headline
                </label>
                <input
                  type="text"
                  value={draft.heroHeadline}
                  onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cover Subtext
                </label>
                <textarea
                  rows={3}
                  value={draft.heroSubtext}
                  onChange={(e) => setDraft({ ...draft, heroSubtext: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                />
              </div>

              {/* Background UI quick jump card */}
              <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-pink-600 shadow-xs border border-white/60">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Background UI Wallpaper &amp; Video</span>
                    <span className="text-[11px] text-slate-500">
                      {draft.backgroundConfig?.type === 'video'
                        ? 'Custom Video active'
                        : draft.backgroundConfig?.type === 'image'
                        ? 'Custom Image active'
                        : 'Default animated 3D river & spinning heart'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('background')}
                  className="px-3 py-1.5 rounded-xl glass-button text-xs font-medium text-pink-700 hover:text-pink-900 cursor-pointer shrink-0"
                >
                  Configure Background
                </button>
              </div>
            </div>
          )}

          {/* SECRET LOCK TAB */}
          {activeTab === 'lock' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl glass-panel-subtle border border-pink-200/60 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Secret Lock Screen
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    This romantic lock vault appears right after the first page (&ldquo;Do you want a surprise?&rdquo;). Your recipient must enter the secret passcode (or use the Love Key hint) to reveal the scrapbook.
                  </p>
                </div>
              </div>

              {/* Enable Toggle */}
              <div className="p-4 rounded-2xl glass-panel-subtle border border-white/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Require Passcode to Enter
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Turn off if you want to skip straight into the scrapbook without a code.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.secretLockConfig?.enabled !== false}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        secretLockConfig: {
                          passcode: draft.secretLockConfig?.passcode || '2026',
                          hint: draft.secretLockConfig?.hint || 'The special year of our sweetest story 💖 (2026)',
                          title: draft.secretLockConfig?.title || 'Secret Love Vault',
                          subtitle: draft.secretLockConfig?.subtitle || 'Enter our 4-digit code to unlock your birthday scrapbook',
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {/* Passcode input and presets */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-700">
                  Secret Passcode (Numbers or Letters)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={draft.secretLockConfig?.passcode || '2026'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        secretLockConfig: {
                          enabled: draft.secretLockConfig?.enabled ?? true,
                          hint: draft.secretLockConfig?.hint || 'The special year of our sweetest story 💖 (2026)',
                          title: draft.secretLockConfig?.title || 'Secret Love Vault',
                          subtitle: draft.secretLockConfig?.subtitle || 'Enter our 4-digit code to unlock your birthday scrapbook',
                          passcode: e.target.value,
                        },
                      })
                    }
                    placeholder="2026"
                    className="flex-1 text-sm font-mono tracking-widest px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/70"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Quick suggestions:</span>
                  {[
                    { label: '2026 (Story Year)', code: '2026', hint: 'The special year of our sweetest story 💖 (2026)' },
                    { label: '1402 (Valentine)', code: '1402', hint: 'Valentine&apos;s day digits 💖 (1402)' },
                    { label: '0520 (I Love You)', code: '0520', hint: '0520 sound like I love you in digits 💖 (0520)' },
                    { label: '1111 (Soulmates)', code: '1111', hint: 'Four ones together forever ✨ (1111)' },
                  ].map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          secretLockConfig: {
                            ...draft.secretLockConfig,
                            enabled: true,
                            passcode: preset.code,
                            hint: preset.hint,
                          },
                        })
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg glass-button hover:bg-pink-100 text-pink-700 font-medium cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hint input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Secret Clue / Hint
                </label>
                <input
                  type="text"
                  value={draft.secretLockConfig?.hint || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      secretLockConfig: {
                        enabled: draft.secretLockConfig?.enabled ?? true,
                        passcode: draft.secretLockConfig?.passcode || '2026',
                        title: draft.secretLockConfig?.title || 'Secret Love Vault',
                        subtitle: draft.secretLockConfig?.subtitle || 'Enter our 4-digit code to unlock your birthday scrapbook',
                        hint: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. The year we first fell in love 💕 (2026)"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/70"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The recipient can tap &ldquo;Need a hint?&rdquo; if they need a little help remembering.
                </p>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lock Screen Title
                  </label>
                  <input
                    type="text"
                    value={draft.secretLockConfig?.title || 'Secret Love Vault'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        secretLockConfig: {
                          enabled: draft.secretLockConfig?.enabled ?? true,
                          passcode: draft.secretLockConfig?.passcode || '2026',
                          hint: draft.secretLockConfig?.hint || '',
                          subtitle: draft.secretLockConfig?.subtitle || 'Enter our 4-digit code to unlock your birthday scrapbook',
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lock Screen Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.secretLockConfig?.subtitle || 'Enter our 4-digit code to unlock your birthday scrapbook'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        secretLockConfig: {
                          enabled: draft.secretLockConfig?.enabled ?? true,
                          passcode: draft.secretLockConfig?.passcode || '2026',
                          hint: draft.secretLockConfig?.hint || '',
                          title: draft.secretLockConfig?.title || 'Secret Love Vault',
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/70"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Upload photos from your phone/computer or paste image links.
                </p>
                <button
                  type="button"
                  onClick={addPhotoItem}
                  className="px-3 py-1.5 rounded-lg bg-pink-100 text-pink-700 text-xs font-medium flex items-center gap-1 hover:bg-pink-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </div>

              <div className="space-y-4">
                {draft.photos.map((photo, i) => (
                  <div
                    key={photo.id || i}
                    className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-pink-50 border border-slate-200 shrink-0 relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-pink-700">Photo #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => deletePhotoItem(i)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Upload image from device</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(i, e)}
                            className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-pink-50 file:text-pink-700"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Or paste image URL</label>
                          <input
                            type="text"
                            value={photo.url.startsWith('data:') ? '[Local image uploaded]' : photo.url}
                            disabled={photo.url.startsWith('data:')}
                            onChange={(e) => updatePhoto(i, 'url', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Caption (e.g. Picnic day)"
                          value={photo.caption}
                          onChange={(e) => updatePhoto(i, 'caption', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                        />
                        <input
                          type="text"
                          placeholder="Secret note on back"
                          value={photo.note || ''}
                          onChange={(e) => updatePhoto(i, 'note', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LETTER TAB */}
          {activeTab === 'letter' && (
            <div className="space-y-6">
              {/* 1. FONT SELECTION SECTION */}
              <div className="glass-panel-subtle p-4 rounded-2xl border border-white/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Letter Font Style &amp; Typography
                    </span>
                  </div>
                  <span className="text-[11px] text-pink-600 font-medium">
                    Current:{' '}
                    <span className="font-bold capitalize">
                      {draft.loveLetter.fontFamily || 'dancing'}
                    </span>
                  </span>
                </div>

                {/* Font Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'dancing',
                      name: 'Romantic Cursive',
                      fontClass: 'font-dancing',
                      desc: 'Dancing Script',
                      sample: 'My heart beats for you',
                    },
                    {
                      id: 'parisienne',
                      name: 'Parisian Calligraphy',
                      fontClass: 'font-parisienne',
                      desc: 'Parisienne',
                      sample: 'Forever and always yours',
                    },
                    {
                      id: 'caveat',
                      name: 'Sweet Handwritten',
                      fontClass: 'font-caveat',
                      desc: 'Caveat Script',
                      sample: 'Cute handwritten memories',
                    },
                    {
                      id: 'marck',
                      name: 'Gentle Script',
                      fontClass: 'font-marck',
                      desc: 'Marck Script',
                      sample: 'Poetic love and sweetness',
                    },
                    {
                      id: 'courier',
                      name: 'Vintage Typewriter',
                      fontClass: 'font-courier',
                      desc: 'Courier Prime',
                      sample: 'A classic typewriter letter',
                    },
                    {
                      id: 'playfair',
                      name: 'Poetic Serif',
                      fontClass: 'font-serif-romantic',
                      desc: 'Playfair Display',
                      sample: 'Editorial romantic elegance',
                    },
                    {
                      id: 'outfit',
                      name: 'Modern Soft Sans',
                      fontClass: 'font-sans',
                      desc: 'Outfit Sans',
                      sample: 'Clean, warm and modern',
                    },
                  ].map((font) => {
                    const isSelected = (draft.loveLetter.fontFamily || 'dancing') === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            loveLetter: {
                              ...draft.loveLetter,
                              fontFamily: font.id as any,
                            },
                          })
                        }
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-pink-100/80 border-pink-500 shadow-xs ring-2 ring-pink-400/40'
                            : 'bg-white/60 border-slate-200/80 hover:bg-white/90 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-slate-800">
                            {font.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className={`${font.fontClass} text-lg text-pink-700 truncate leading-snug`}>
                          {font.sample}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1">{font.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Font Size & Ink Color Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200/50">
                  {/* Size Selector */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Font Size
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'sm', label: 'Small' },
                        { id: 'md', label: 'Normal' },
                        { id: 'lg', label: 'Large' },
                        { id: 'xl', label: 'X-Large' },
                      ].map((sz) => {
                        const isCurrent = (draft.loveLetter.fontSize || 'md') === sz.id;
                        return (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                loveLetter: { ...draft.loveLetter, fontSize: sz.id as any },
                              })
                            }
                            className={`py-1.5 text-xs rounded-xl font-medium cursor-pointer transition-colors ${
                              isCurrent
                                ? 'bg-pink-600 text-white shadow-xs font-semibold'
                                : 'bg-white/60 text-slate-700 hover:bg-white border border-slate-200'
                            }`}
                          >
                            {sz.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ink Tone */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-pink-500" />
                      Letter Ink Color
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'rose', name: 'Rose', bg: 'bg-rose-700' },
                        { id: 'espresso', name: 'Espresso', bg: 'bg-stone-800' },
                        { id: 'wine', name: 'Wine', bg: 'bg-red-950' },
                        { id: 'midnight', name: 'Midnight', bg: 'bg-indigo-950' },
                        { id: 'blush', name: 'Blush', bg: 'bg-pink-700' },
                      ].map((ink) => {
                        const isCurrent = (draft.loveLetter.inkColor || 'rose') === ink.id;
                        return (
                          <button
                            key={ink.id}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                loveLetter: { ...draft.loveLetter, inkColor: ink.id as any },
                              })
                            }
                            className={`flex-1 py-1 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-white border-pink-500 shadow-xs ring-2 ring-pink-400/40 font-semibold'
                                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                            }`}
                            title={ink.name}
                          >
                            <span className={`w-3 h-3 rounded-full ${ink.bg}`} />
                            <span className="hidden sm:inline text-[10px]">{ink.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. EMOJI CUSTOMIZATION STATION */}
              <div className="glass-panel-subtle p-4 rounded-2xl border border-white/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Customize Letter with Emojis
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-600 text-[11px]">Insert into:</span>
                    <select
                      value={emojiTargetField}
                      onChange={(e) => setEmojiTargetField(e.target.value as any)}
                      className="text-xs px-2.5 py-1 bg-white rounded-lg border border-pink-300 font-medium text-pink-700 focus:outline-pink-500 cursor-pointer shadow-xs"
                    >
                      <option value="salutation">Letter Salutation</option>
                      <option value="p0">Paragraph 1</option>
                      <option value="p1">Paragraph 2</option>
                      <option value="p2">Paragraph 3</option>
                      <option value="closing">Sign-off / Closing</option>
                      <option value="psNote">P.S. Note</option>
                    </select>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'romance', label: '💖 Love & Hearts' },
                    { id: 'flowers', label: '🌸 Flowers & Nature' },
                    { id: 'cute', label: '🧸 Cute & Sweet' },
                    { id: 'sparkles', label: '✨ Sparkles & Magic' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEmojiCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-colors ${
                        emojiCategory === cat.id
                          ? 'bg-pink-600 text-white shadow-xs font-medium'
                          : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Emoji Tap Grid */}
                <div className="p-2.5 bg-white/70 rounded-xl border border-pink-100 grid grid-cols-8 sm:grid-cols-12 md:grid-cols-14 gap-1.5">
                  {(emojiCategory === 'romance'
                    ? ['💖', '💌', '💕', '💘', '💓', '💗', '💞', '💝', '🌹', '🥀', '💋', '💍', '🥂', '🕯️', '🥺', '❤️‍🔥', '🥰', '😍', '💐', '👩‍❤️‍👨', '🫶', '🕊️', '🌸', '👑', '💎', '🎀', '✨', '🍓']
                    : emojiCategory === 'flowers'
                    ? ['🌸', '🌺', '🌷', '🌻', '💐', '🌹', '🥀', '🌿', '🍃', '🌾', '🍀', '🦋', '🕊️', '🌙', '⭐', '✨', '💫', '☀️', '🌈', '🌼', '🪻', '🍄', '🌴', '🫧', '💧', '🌊', '❄️', '🪴']
                    : emojiCategory === 'cute'
                    ? ['🧸', '🍯', '🍓', '🍒', '🍰', '🧁', '🎂', '🍫', '🎀', '☕', '🐰', '🐱', '🐣', '🎈', '🎉', '🥞', '🍪', '🍩', '🍧', '🍬', '🍡', '🍮', '🍨', '🍿', '🍑', '🍉', '🍼', '🐾']
                    : ['✨', '💫', '🌟', '⭐', '🔮', '🧚‍♀️', '🌙', '💖', '💌', '💎', '🥂', '🎉', '🎊', '🎇', '🎆', '🪄', '🦄', '🎀', '🕊️', '💐', '🌷', '🌸', '🌹', '🧸', '🍰', '🎂', '💍', '👑']
                  ).map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const cur = draft.loveLetter;
                        if (emojiTargetField === 'salutation') {
                          setDraft({
                            ...draft,
                            loveLetter: {
                              ...cur,
                              salutation: cur.salutation ? `${cur.salutation} ${emoji}` : emoji,
                            },
                          });
                        } else if (emojiTargetField === 'closing') {
                          setDraft({
                            ...draft,
                            loveLetter: {
                              ...cur,
                              closing: cur.closing ? `${cur.closing} ${emoji}` : emoji,
                            },
                          });
                        } else if (emojiTargetField === 'psNote') {
                          setDraft({
                            ...draft,
                            loveLetter: {
                              ...cur,
                              psNote: cur.psNote ? `${cur.psNote} ${emoji}` : emoji,
                            },
                          });
                        } else {
                          const pIndex = emojiTargetField === 'p0' ? 0 : emojiTargetField === 'p1' ? 1 : 2;
                          const pars = [...(cur.paragraphs || [])];
                          pars[pIndex] = pars[pIndex] ? `${pars[pIndex]} ${emoji}` : emoji;
                          setDraft({
                            ...draft,
                            loveLetter: {
                              ...cur,
                              paragraphs: pars,
                            },
                          });
                        }
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-pink-100 flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-all cursor-pointer select-none"
                      title={`Tap to insert ${emoji} into ${emojiTargetField}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Quick Emoji Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = draft.loveLetter;
                      const pars = (cur.paragraphs || []).map((p) =>
                        p.includes('💖') ? p : `${p} 💖✨`
                      );
                      setDraft({
                        ...draft,
                        loveLetter: {
                          ...cur,
                          salutation: cur.salutation.includes('💖') ? cur.salutation : `${cur.salutation} 💖`,
                          closing: cur.closing.includes('💌') ? cur.closing : `${cur.closing} 💌`,
                          paragraphs: pars,
                        },
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    + Hearts &amp; Sparkles 💖✨
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = draft.loveLetter;
                      const pars = (cur.paragraphs || []).map((p) =>
                        p.includes('🌸') ? p : `${p} 🌸🌹`
                      );
                      setDraft({
                        ...draft,
                        loveLetter: {
                          ...cur,
                          salutation: cur.salutation.includes('🌸') ? cur.salutation : `${cur.salutation} 🌸`,
                          paragraphs: pars,
                        },
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    + Rose Garden 🌸🌹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = draft.loveLetter;
                      const pars = (cur.paragraphs || []).map((p) =>
                        p.includes('🧸') ? p : `${p} 🧸🍓`
                      );
                      setDraft({
                        ...draft,
                        loveLetter: {
                          ...cur,
                          paragraphs: pars,
                        },
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    + Cute &amp; Sweet 🧸🍓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const stripEmojis = (str: string) =>
                        str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
                      const cur = draft.loveLetter;
                      setDraft({
                        ...draft,
                        loveLetter: {
                          ...cur,
                          salutation: stripEmojis(cur.salutation),
                          closing: stripEmojis(cur.closing),
                          psNote: cur.psNote ? stripEmojis(cur.psNote) : '',
                          paragraphs: (cur.paragraphs || []).map(stripEmojis),
                        },
                      });
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs cursor-pointer transition-colors ml-auto"
                    title="Remove emojis from letter text"
                  >
                    Clean Emojis 🧹
                  </button>
                </div>
              </div>

              {/* 3. WAX SEAL & STAMP EMOJIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wax Seal Selector */}
                <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Envelope Wax Seal Emoji</span>
                    </label>
                    <span className="text-xl leading-none">
                      {draft.loveLetter.waxSealEmoji || '💌'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 bg-white/60 p-2 rounded-xl border border-slate-200">
                    {['💌', '💖', '🌹', '👑', '🎀', '🧸', '💍', '🌸', '🕊️', '🍯', '✨', '🍓', '🎂', '🌙', '🦋', '🕯️'].map((emoji) => {
                      const isCurrent = (draft.loveLetter.waxSealEmoji || '💌') === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              loveLetter: { ...draft.loveLetter, waxSealEmoji: emoji },
                            })
                          }
                          className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-rose-600 text-white shadow-xs scale-110 ring-2 ring-rose-400'
                              : 'hover:bg-pink-100 text-slate-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Postage Stamp Selector */}
                <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Envelope Postage Stamp Emoji</span>
                    </label>
                    <span className="text-xl leading-none">
                      {draft.loveLetter.stampEmoji || '💖'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 bg-white/60 p-2 rounded-xl border border-slate-200">
                    {['💖', '🌸', '🧸', '🍓', '💌', '🌹', '🦋', '🧁', '⭐', '🕊️', '💐', '🎂', '🍒', '🌻'].map((emoji) => {
                      const isCurrent = (draft.loveLetter.stampEmoji || '💖') === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              loveLetter: { ...draft.loveLetter, stampEmoji: emoji },
                            })
                          }
                          className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-rose-600 text-white shadow-xs scale-110 ring-2 ring-rose-400'
                              : 'hover:bg-pink-100 text-slate-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. DECORATIVE LETTER BORDER STAMPS */}
              <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Letter Border Decorative Stamps</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {(draft.loveLetter.decorativeStickers || []).length} active
                  </span>
                </div>

                {/* Active Stickers Chips */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 bg-white/60 rounded-xl border border-slate-200">
                  {(draft.loveLetter.decorativeStickers || ['🌸', '✨', '🎀', '💌', '🌹', '🕊️']).map(
                    (stk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-100 text-slate-800 text-sm border border-pink-200 shadow-2xs"
                      >
                        <span>{stk}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const curStk = draft.loveLetter.decorativeStickers || [
                              '🌸', '✨', '🎀', '💌', '🌹', '🕊️',
                            ];
                            setDraft({
                              ...draft,
                              loveLetter: {
                                ...draft.loveLetter,
                                decorativeStickers: curStk.filter((_, i) => i !== idx),
                              },
                            });
                          }}
                          className="text-slate-400 hover:text-rose-600 text-xs font-bold leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )
                  )}
                </div>

                {/* Add new stamp shortcuts */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-500 mr-1">Tap to add:</span>
                  {['🌸', '💖', '✨', '💌', '🌹', '🎀', '🧸', '🍓', '💍', '🕊️', '🍯', '💫', '🎂', '🥂', '🦋', '💐'].map(
                    (em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          const curStk = draft.loveLetter.decorativeStickers || [
                            '🌸', '✨', '🎀', '💌', '🌹', '🕊️',
                          ];
                          setDraft({
                            ...draft,
                            loveLetter: {
                              ...draft.loveLetter,
                              decorativeStickers: [...curStk, em],
                            },
                          });
                        }}
                        className="w-6 h-6 rounded-md hover:bg-pink-100 text-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
                      >
                        {em}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 5. LETTER TEXT EDITING FIELDS (PREVIEWED IN CHOSEN FONT) */}
              <div className="space-y-4 pt-2 border-t border-pink-200/50">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Letter Text Content</span>
                  <span className="text-[11px] font-normal text-pink-600">
                    Previewing in{' '}
                    <span className="font-semibold capitalize">
                      {draft.loveLetter.fontFamily || 'dancing'}
                    </span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Letter Salutation</span>
                    <button
                      type="button"
                      onClick={() => setEmojiTargetField('salutation')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        emojiTargetField === 'salutation'
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                      }`}
                    >
                      Target with emoji toolbar
                    </button>
                  </label>
                  <input
                    type="text"
                    value={draft.loveLetter.salutation}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, salutation: e.target.value },
                      })
                    }
                    className={`w-full text-base px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/80 ${
                      draft.loveLetter.fontFamily === 'parisienne'
                        ? 'font-parisienne'
                        : draft.loveLetter.fontFamily === 'caveat'
                        ? 'font-caveat'
                        : draft.loveLetter.fontFamily === 'marck'
                        ? 'font-marck'
                        : draft.loveLetter.fontFamily === 'courier'
                        ? 'font-courier'
                        : draft.loveLetter.fontFamily === 'playfair'
                        ? 'font-serif-romantic'
                        : draft.loveLetter.fontFamily === 'outfit'
                        ? 'font-sans'
                        : 'font-dancing'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Paragraph 1</span>
                    <button
                      type="button"
                      onClick={() => setEmojiTargetField('p0')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        emojiTargetField === 'p0'
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                      }`}
                    >
                      Target with emoji toolbar
                    </button>
                  </label>
                  <textarea
                    rows={3}
                    value={draft.loveLetter.paragraphs[0] || ''}
                    onChange={(e) => {
                      const pars = [...draft.loveLetter.paragraphs];
                      pars[0] = e.target.value;
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, paragraphs: pars },
                      });
                    }}
                    className={`w-full text-base px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/80 leading-relaxed ${
                      draft.loveLetter.fontFamily === 'parisienne'
                        ? 'font-parisienne'
                        : draft.loveLetter.fontFamily === 'caveat'
                        ? 'font-caveat'
                        : draft.loveLetter.fontFamily === 'marck'
                        ? 'font-marck'
                        : draft.loveLetter.fontFamily === 'courier'
                        ? 'font-courier'
                        : draft.loveLetter.fontFamily === 'playfair'
                        ? 'font-serif-romantic'
                        : draft.loveLetter.fontFamily === 'outfit'
                        ? 'font-sans'
                        : 'font-dancing'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Paragraph 2</span>
                    <button
                      type="button"
                      onClick={() => setEmojiTargetField('p1')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        emojiTargetField === 'p1'
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                      }`}
                    >
                      Target with emoji toolbar
                    </button>
                  </label>
                  <textarea
                    rows={3}
                    value={draft.loveLetter.paragraphs[1] || ''}
                    onChange={(e) => {
                      const pars = [...draft.loveLetter.paragraphs];
                      pars[1] = e.target.value;
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, paragraphs: pars },
                      });
                    }}
                    className={`w-full text-base px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/80 leading-relaxed ${
                      draft.loveLetter.fontFamily === 'parisienne'
                        ? 'font-parisienne'
                        : draft.loveLetter.fontFamily === 'caveat'
                        ? 'font-caveat'
                        : draft.loveLetter.fontFamily === 'marck'
                        ? 'font-marck'
                        : draft.loveLetter.fontFamily === 'courier'
                        ? 'font-courier'
                        : draft.loveLetter.fontFamily === 'playfair'
                        ? 'font-serif-romantic'
                        : draft.loveLetter.fontFamily === 'outfit'
                        ? 'font-sans'
                        : 'font-dancing'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>Paragraph 3</span>
                    <button
                      type="button"
                      onClick={() => setEmojiTargetField('p2')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        emojiTargetField === 'p2'
                          ? 'bg-pink-600 text-white'
                          : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                      }`}
                    >
                      Target with emoji toolbar
                    </button>
                  </label>
                  <textarea
                    rows={3}
                    value={draft.loveLetter.paragraphs[2] || ''}
                    onChange={(e) => {
                      const pars = [...draft.loveLetter.paragraphs];
                      pars[2] = e.target.value;
                      setDraft({
                        ...draft,
                        loveLetter: { ...draft.loveLetter, paragraphs: pars },
                      });
                    }}
                    className={`w-full text-base px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/80 leading-relaxed ${
                      draft.loveLetter.fontFamily === 'parisienne'
                        ? 'font-parisienne'
                        : draft.loveLetter.fontFamily === 'caveat'
                        ? 'font-caveat'
                        : draft.loveLetter.fontFamily === 'marck'
                        ? 'font-marck'
                        : draft.loveLetter.fontFamily === 'courier'
                        ? 'font-courier'
                        : draft.loveLetter.fontFamily === 'playfair'
                        ? 'font-serif-romantic'
                        : draft.loveLetter.fontFamily === 'outfit'
                        ? 'font-sans'
                        : 'font-dancing'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <span>Sign-off / Closing</span>
                      <button
                        type="button"
                        onClick={() => setEmojiTargetField('closing')}
                        className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                          emojiTargetField === 'closing'
                            ? 'bg-pink-600 text-white'
                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                        }`}
                      >
                        Target
                      </button>
                    </label>
                    <input
                      type="text"
                      value={draft.loveLetter.closing}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          loveLetter: { ...draft.loveLetter, closing: e.target.value },
                        })
                      }
                      className={`w-full text-base px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/80 ${
                        draft.loveLetter.fontFamily === 'parisienne'
                          ? 'font-parisienne'
                          : draft.loveLetter.fontFamily === 'caveat'
                          ? 'font-caveat'
                          : draft.loveLetter.fontFamily === 'marck'
                          ? 'font-marck'
                          : draft.loveLetter.fontFamily === 'courier'
                          ? 'font-courier'
                          : draft.loveLetter.fontFamily === 'playfair'
                          ? 'font-serif-romantic'
                          : draft.loveLetter.fontFamily === 'outfit'
                          ? 'font-sans'
                          : 'font-dancing'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <span>P.S. Note</span>
                      <button
                        type="button"
                        onClick={() => setEmojiTargetField('psNote')}
                        className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                          emojiTargetField === 'psNote'
                            ? 'bg-pink-600 text-white'
                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                        }`}
                      >
                        Target
                      </button>
                    </label>
                    <input
                      type="text"
                      value={draft.loveLetter.psNote || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          loveLetter: { ...draft.loveLetter, psNote: e.target.value },
                        })
                      }
                      className={`w-full text-base px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 bg-white/80 ${
                        draft.loveLetter.fontFamily === 'parisienne'
                          ? 'font-parisienne'
                          : draft.loveLetter.fontFamily === 'caveat'
                          ? 'font-caveat'
                          : draft.loveLetter.fontFamily === 'marck'
                          ? 'font-marck'
                          : draft.loveLetter.fontFamily === 'courier'
                          ? 'font-courier'
                          : draft.loveLetter.fontFamily === 'playfair'
                          ? 'font-serif-romantic'
                          : draft.loveLetter.fontFamily === 'outfit'
                          ? 'font-sans'
                          : 'font-dancing'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMORIES TAB */}
          {activeTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Add meaningful milestones, dates, or stories.
                </p>
                <button
                  type="button"
                  onClick={addMemoryItem}
                  className="px-3 py-1.5 rounded-lg bg-pink-100 text-pink-700 text-xs font-medium flex items-center gap-1 hover:bg-pink-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Memory</span>
                </button>
              </div>

              <div className="space-y-3">
                {draft.memories.map((mem, i) => (
                  <div
                    key={mem.id || i}
                    className="p-4 rounded-2xl bg-white border border-pink-100 space-y-3 relative shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-pink-700">Memory #{i + 1}</span>
                        {mem.photoUrl && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>Photo attached</span>
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMemoryItem(i)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Title"
                        value={mem.title}
                        onChange={(e) => updateMemory(i, 'title', e.target.value)}
                        className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="Date (e.g. Autumn)"
                        value={mem.date}
                        onChange={(e) => updateMemory(i, 'date', e.target.value)}
                        className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={mem.location || ''}
                        onChange={(e) => updateMemory(i, 'location', e.target.value)}
                        className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="Tag (e.g. First Spark)"
                        value={mem.tag || ''}
                        onChange={(e) => updateMemory(i, 'tag', e.target.value)}
                        className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Story / What happened"
                      value={mem.story}
                      onChange={(e) => updateMemory(i, 'story', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                    />

                    {/* Photo Control Section */}
                    <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-pink-600" />
                          <span>Memory Photo</span>
                        </label>
                        {mem.photoUrl && (
                          <button
                            type="button"
                            onClick={() => updateMemory(i, 'photoUrl', '')}
                            className="text-[10px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Photo</span>
                          </button>
                        )}
                      </div>

                      {mem.photoUrl && (
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-pink-200 bg-white shadow-2xs shrink-0">
                            <img
                              src={mem.photoUrl}
                              alt="Memory preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 flex-1 truncate">
                            {mem.photoUrl.startsWith('data:')
                              ? 'Uploaded from device'
                              : mem.photoUrl}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">
                            Upload image from device
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMemoryPhotoUpload(i, e)}
                            className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-white file:text-pink-700 file:border file:border-pink-200 file:shadow-2xs cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">
                            Or paste image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={mem.photoUrl?.startsWith('data:') ? '[Local image uploaded]' : mem.photoUrl || ''}
                            disabled={mem.photoUrl?.startsWith('data:')}
                            onChange={(e) => updateMemory(i, 'photoUrl', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* Quick preset choices */}
                      <div className="flex items-center gap-1 pt-1 overflow-x-auto text-[10px]">
                        <span className="text-slate-400 shrink-0">Presets:</span>
                        {[
                          { name: 'Coffee', url: '/src/assets/images/scrapbook_romantic_memory_1792606780386.jpg' },
                          { name: 'Flowers', url: '/src/assets/images/pastel_pink_flowers_1792606781711.jpg' },
                          { name: 'Sunset', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80' },
                          { name: 'Cake', url: '/src/assets/images/birthday_surprise_cake_1792606781095.jpg' },
                        ].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => updateMemory(i, 'photoUrl', preset.url)}
                            className="px-2 py-0.5 rounded bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 shrink-0 cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REASONS TAB */}
          {activeTab === 'reasons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Reasons why she is special to you.
                </p>
                <button
                  type="button"
                  onClick={addReasonItem}
                  className="px-3 py-1.5 rounded-lg bg-pink-100 text-pink-700 text-xs font-medium flex items-center gap-1 hover:bg-pink-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reason</span>
                </button>
              </div>

              <div className="space-y-3">
                {draft.reasons.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="p-3.5 rounded-2xl bg-white border border-pink-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-700">Reason #{r.number}</span>
                      <button
                        type="button"
                        onClick={() => deleteReasonItem(i)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Title"
                      value={r.title}
                      onChange={(e) => updateReason(i, 'title', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                    />
                    <textarea
                      rows={2}
                      placeholder="Description"
                      value={r.description}
                      onChange={(e) => updateReason(i, 'description', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-pink-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SURPRISE & AUDIO TAB */}
          {activeTab === 'surprise' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Surprise Pass / Voucher
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Voucher Title
                  </label>
                  <input
                    type="text"
                    value={draft.finalSurprise.couponTitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        finalSurprise: { ...draft.finalSurprise, couponTitle: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Redemption Code
                  </label>
                  <input
                    type="text"
                    value={draft.finalSurprise.couponCode}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        finalSurprise: { ...draft.finalSurprise, couponCode: e.target.value },
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Voucher Privileges / Details
                </label>
                <textarea
                  rows={3}
                  value={draft.finalSurprise.couponDetails}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      finalSurprise: { ...draft.finalSurprise, couponDetails: e.target.value },
                    })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Personal Promise
                </label>
                <input
                  type="text"
                  value={draft.finalSurprise.personalPromise}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      finalSurprise: { ...draft.finalSurprise, personalPromise: e.target.value },
                    })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500"
                />
              </div>

              <div className="pt-4 border-t border-pink-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Background Music Settings
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="radio"
                      name="soundtrack"
                      checked={draft.audioConfig.soundtrackType === 'music-box'}
                      onChange={() =>
                        setDraft({
                          ...draft,
                          audioConfig: {
                            ...draft.audioConfig,
                            soundtrackType: 'music-box',
                            customUrl: undefined,
                          },
                        })
                      }
                      className="accent-pink-500"
                    />
                    <span>Dreamy Procedural Music Box (Sweet Lullaby - 100% Reliable &amp; Offline)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="radio"
                      name="soundtrack"
                      checked={draft.audioConfig.soundtrackType === 'custom-url'}
                      onChange={() =>
                        setDraft({
                          ...draft,
                          audioConfig: {
                            ...draft.audioConfig,
                            soundtrackType: 'custom-url',
                          },
                        })
                      }
                      className="accent-pink-500"
                    />
                    <span>Custom Audio / MP3 Web Stream</span>
                  </label>

                  {draft.audioConfig.soundtrackType === 'custom-url' && (
                    <input
                      type="text"
                      placeholder="Paste audio URL (.mp3 or stream)"
                      value={draft.audioConfig.customUrl || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          audioConfig: {
                            ...draft.audioConfig,
                            customUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-pink-500 mt-1"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BACKGROUND UI TAB */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Scrapbook Background UI</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Choose the default animated romantic river &amp; 3D spinning heart, or upload your own wallpaper photo or video from your device.
                </p>
              </div>

              {/* Custom Media Active Notice */}
              {draft.backgroundConfig?.url ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Custom {draft.backgroundConfig.type === 'video' ? 'video' : 'image'} active!</strong> The default background image, 3D heart, and river scene are removed.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBgConfig({ type: 'default', url: undefined })}
                    className="text-[11px] text-pink-700 hover:text-pink-900 font-semibold underline shrink-0 cursor-pointer ml-2"
                  >
                    Restore default
                  </button>
                </div>
              ) : null}

              {/* Preset 1: Default Romantic 3D Scene */}
              <div
                onClick={() => updateBgConfig({ type: 'default', url: undefined })}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  !draft.backgroundConfig?.url && (draft.backgroundConfig?.type || 'default') === 'default'
                    ? 'border-pink-500 glass-panel shadow-md'
                    : 'border-white/60 hover:border-pink-300 glass-panel-subtle'
                }`}
              >
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative border border-white/40">
                  <img
                    src="/romantic_bg.png"
                    alt="Romantic animated river"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-pink-300" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Romantic River &amp; 3D Heart (Default Scene)
                    </span>
                    {!draft.backgroundConfig?.url && (draft.backgroundConfig?.type || 'default') === 'default' && (
                      <Check className="w-4 h-4 text-pink-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Animated sunset river in motion, falling flower petals, and 3D spinning crystal heart.
                  </p>
                </div>
              </div>

              {/* Preset 2: Upload from Device */}
              <div className="p-4 rounded-2xl border border-white/70 glass-panel-subtle space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Add from Your Device (Phone or Computer)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Image Upload Button */}
                  <label className="p-3 rounded-xl border border-white/70 hover:border-pink-400 glass-button transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                    <ImageIcon className="w-6 h-6 text-pink-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-800">Add Image File</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, GIF, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBgFileUpload('image', e)}
                      className="hidden"
                    />
                  </label>

                  {/* Video Upload Button */}
                  <label className="p-3 rounded-xl border border-white/70 hover:border-pink-400 glass-button transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                    <Video className="w-6 h-6 text-pink-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-800">Add Video File</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">MP4, WebM, MOV</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleBgFileUpload('video', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* URL Fallback */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Or paste web URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/video.mp4 or photo.jpg"
                      value={draft.backgroundConfig?.url?.startsWith('data:') ? '[File loaded from device]' : (draft.backgroundConfig?.url || '')}
                      disabled={draft.backgroundConfig?.url?.startsWith('data:')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isVid = val.endsWith('.mp4') || val.endsWith('.webm') || val.endsWith('.mov');
                        updateBgConfig({
                          url: val,
                          type: isVid ? 'video' : 'image',
                        });
                      }}
                      className="flex-1 text-xs px-3 py-2 border border-white/70 bg-white/70 rounded-xl focus:bg-white focus:outline-pink-500 text-slate-800"
                    />
                    {draft.backgroundConfig?.url && (
                      <button
                        type="button"
                        onClick={() => updateBgConfig({ url: '', type: 'default' })}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50/70 rounded-xl cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Box */}
                {draft.backgroundConfig?.url && (
                  <div className="rounded-2xl overflow-hidden border border-white/60 aspect-[16/9] relative bg-slate-900 mt-2 shadow-inner">
                    {draft.backgroundConfig.type === 'video' ? (
                      <video
                        src={draft.backgroundConfig.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={draft.backgroundConfig.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{draft.backgroundConfig.type === 'video' ? 'Custom Video Background Active' : 'Custom Image Background Active'}</span>
                    </div>
                  </div>
                )}

                {bgPreviewError && (
                  <p className="text-xs text-rose-600 font-medium">{bgPreviewError}</p>
                )}
              </div>

              {/* Falling Flowers Overlay Checkbox */}
              <label className="flex items-center gap-2 p-3 rounded-2xl glass-panel-subtle border border-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.backgroundConfig?.enableOverlayEffects ?? true}
                  onChange={(e) => updateBgConfig({ enableOverlayEffects: e.target.checked })}
                  className="accent-pink-500 rounded"
                />
                <span className="text-xs text-slate-700">
                  Keep gentle floating rose petals overlay on top of background
                </span>
              </label>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => updateBgConfig({ type: 'default', url: undefined, enableOverlayEffects: true })}
                  className="text-xs text-slate-600 hover:text-pink-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default Romantic Scene</span>
                </button>
              </div>
            </div>
          )}

          {/* EXPORT & BACKUP TAB */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 space-y-2">
                <h4 className="text-xs font-bold text-pink-800">Save &amp; Backup Your Scrapbook</h4>
                <p className="text-xs text-pink-700 leading-relaxed">
                  You can download your customized scrapbook as a single JSON file, or restore one anytime.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <label className="px-3.5 py-2 rounded-xl bg-white border border-pink-300 text-pink-700 hover:bg-pink-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Reset to Defaults</h4>
                  <p className="text-xs text-slate-500">Restore the original romantic sample.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Sample</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Glassmorphism */}
        <div className="p-4 sm:p-5 border-t border-pink-200/50 flex items-center justify-between gap-3 bg-white/40 backdrop-blur-md">
          <div className="text-xs text-emerald-700 font-medium">
            {savedNotice ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Saved successfully!
              </span>
            ) : (
              <span className="text-slate-500">Edits save to your browser instantly</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!embedded && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 glass-button cursor-pointer"
              >
                Close
              </button>
            )}

            {onOpenPublish && (
              <button
                type="button"
                onClick={onOpenPublish}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs font-medium text-white glass-button-primary shadow-lg shadow-pink-400/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return modalInner;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {modalInner}
    </div>
  );
};
