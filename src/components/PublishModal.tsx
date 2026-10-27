import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  QrCode,
  Heart,
  Loader2,
  AlertCircle,
  RefreshCw,
  Gift,
  Clock,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { ScrapbookConfig } from '../types/scrapbook';
import { publishGift, renewGift } from '../utils/giftStorage';
import {
  ExpirationSetting,
  EXPIRATION_OPTIONS,
  calculateExpirationDate,
  formatExpirationDisplay,
  isGiftExpired,
  getRemainingTimeText,
} from '../utils/expiration';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScrapbookConfig;
  existingGiftId?: string;
  existingEditToken?: string;
  onPublishedSuccess: (giftId: string, editToken: string, expiresAt?: string | null) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  config,
  existingGiftId,
  existingEditToken,
  onPublishedSuccess,
}) => {
  const [status, setStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [giftId, setGiftId] = useState<string>(existingGiftId || '');
  const [editToken, setEditToken] = useState<string>(existingEditToken || '');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Expiration settings state (Defaults to 1 calendar month)
  const [expirationSetting, setExpirationSetting] = useState<ExpirationSetting>('1m');
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [currentExpiresAt, setCurrentExpiresAt] = useState<string | null>(null);

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      if (existingGiftId) {
        setGiftId(existingGiftId);
        setEditToken(existingEditToken || '');
        const fullUrl = `${window.location.origin}/gift/${existingGiftId}`;
        setShareUrl(fullUrl);
      }
      setStatus('idle');
      setErrorMessage(null);
      setSuccessNotice(null);
      setCopied(false);
    }
  }, [isOpen, existingGiftId, existingEditToken]);

  // Minimum date for custom picker (current moment + 5 minutes)
  const minCustomDateTime = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    // Format YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  // Calculated preview timestamp for idle configuration
  const previewExpiresAt = useMemo(() => {
    try {
      return calculateExpirationDate(
        expirationSetting,
        new Date(),
        expirationSetting === 'custom' ? customDateTime : null
      );
    } catch {
      return null;
    }
  }, [expirationSetting, customDateTime]);

  // Generate QR code when shareUrl is set and canvas is ready
  useEffect(() => {
    if (shareUrl && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shareUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#831843', // deep romantic rose
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('Failed to generate QR code canvas:', err);
        }
      );
    }
  }, [shareUrl, status, currentExpiresAt]);

  if (!isOpen) return null;

  // Validation
  const validateGift = (): string | null => {
    if (!config.recipientName.trim()) {
      return 'Please enter a recipient name in the Basics tab before publishing.';
    }
    if (!config.senderName.trim()) {
      return 'Please specify who this gift is from in the Basics tab.';
    }
    if (expirationSetting === 'custom') {
      if (!customDateTime) {
        return 'Please choose a custom expiration date and time.';
      }
      const customTime = new Date(customDateTime).getTime();
      if (isNaN(customTime) || customTime <= Date.now()) {
        return 'Custom expiration date must be in the future.';
      }
    }
    return null;
  };

  const handleStartPublish = async () => {
    const valError = validateGift();
    if (valError) {
      setErrorMessage(valError);
      return;
    }

    setStatus('publishing');
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await publishGift(
        config,
        giftId || undefined,
        editToken || undefined,
        expirationSetting,
        expirationSetting === 'custom' ? customDateTime : null
      );
      const fullUrl = `${window.location.origin}${result.url}`;
      
      setGiftId(result.id);
      setEditToken(result.editToken);
      setShareUrl(fullUrl);
      setCurrentExpiresAt(result.expiresAt);
      setStatus('success');
      onPublishedSuccess(result.id, result.editToken, result.expiresAt);

      // Sweet celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f43f68', '#ec4899', '#fbcfe8', '#ffd166', '#a855f7'],
        });
      } catch {}
    } catch (err: any) {
      console.error('Publishing error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong while publishing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renew / Extend active or expired gift
  const handleRenewGift = async () => {
    if (!giftId || !editToken) return;
    setIsRenewing(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const result = await renewGift(
        giftId,
        editToken,
        expirationSetting,
        expirationSetting === 'custom' ? customDateTime : null
      );

      if (result.success) {
        setCurrentExpiresAt(result.expiresAt || null);
        setSuccessNotice('Gift link successfully extended and active!');
        onPublishedSuccess(giftId, editToken, result.expiresAt);
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#f43f68', '#fbcfe8'],
          });
        } catch {}
      } else {
        setErrorMessage(result.error || 'Failed to renew gift.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error renewing gift link.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;

    // Create high-res download card
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = 600;
    downloadCanvas.height = 780;
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 780);
    gradient.addColorStop(0, '#fdf2f8');
    gradient.addColorStop(0.5, '#fff1f2');
    gradient.addColorStop(1, '#fce7f3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 780);

    // Cute border
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 740);

    // Title
    ctx.fillStyle = '#9d174d';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A Special Surprise For You', 300, 75);

    // Recipient Name
    ctx.fillStyle = '#e11d48';
    ctx.font = 'italic 26px serif';
    ctx.fillText(`For ${config.recipientName || 'Someone Special'} 💖`, 300, 118);

    // Draw the QR Code centered
    ctx.drawImage(canvasRef.current, 150, 150, 300, 300);

    // Instructions
    ctx.fillStyle = '#4b5563';
    ctx.font = '18px sans-serif';
    ctx.fillText('Scan with your phone camera to open', 300, 490);
    ctx.fillText('your personalized digital scrapbook surprise!', 300, 520);

    // Expiration Notice on the card
    ctx.fillStyle = '#be185d';
    ctx.font = 'bold 15px sans-serif';
    const expiryCardText = currentExpiresAt
      ? `Valid Through: ${new Date(currentExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`
      : 'Permanent Digital Keepsake';
    ctx.fillText(expiryCardText, 300, 565);

    // Sender signature
    ctx.fillStyle = '#be185d';
    ctx.font = 'italic 22px serif';
    ctx.fillText(`With endless love, ${config.senderName || 'Your Love'} 💌`, 300, 630);

    // Bottom link note
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px sans-serif';
    ctx.fillText(shareUrl, 300, 700);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Scrapbook-QR-${(config.recipientName || 'Gift').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };

  const handleOpenGift = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isExpired = isGiftExpired(currentExpiresAt);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-pink-200/80 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Soft background accents */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-pink-50 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20 mb-3">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {status === 'success' || existingGiftId ? 'Share & Manage Your Gift' : 'Publish & Share Digital Gift'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {status === 'success' || existingGiftId
              ? `Your scrapbook for ${config.recipientName} is live with automatic expiration protection.`
              : `Create a unique public link, scannable QR code, and customize link expiration for ${config.recipientName}.`}
          </p>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successNotice}</div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Notice: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* STATE 1: IDLE / Ready to publish */}
        {status === 'idle' && !shareUrl && (
          <div className="space-y-5">
            {/* Gift summary card */}
            <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-200/60 space-y-3">
              <div className="flex items-center gap-3 text-slate-700 text-sm">
                <Gift className="w-5 h-5 text-pink-500 shrink-0" />
                <div>
                  <span className="font-medium text-slate-800">Gift For: </span>
                  <span className="font-semibold text-pink-600">{config.recipientName || '(Not set yet)'}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="font-medium text-slate-800">From: </span>
                  <span className="font-semibold text-pink-600">{config.senderName || '(Not set yet)'}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed border-t border-pink-200/50 pt-2.5">
                Includes {config.photos.length} photos, {config.memories.length} memories, {config.reasons.length} appreciation reasons, personalized love letter, and secret birthday cake surprise.
              </div>
            </div>

            {/* EXPIRATION SETTINGS SECTION */}
            <div className="p-4 rounded-2xl bg-white/90 border border-pink-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-pink-600" />
                  <span>Link Availability &amp; Expiration</span>
                </label>
                <span className="text-[10px] font-semibold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                  Default: 1 Calendar Month
                </span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {EXPIRATION_OPTIONS.filter((o) => o.id !== 'custom').map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExpirationSetting(opt.id)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                      expirationSetting === opt.id
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs font-semibold'
                        : 'bg-pink-50/60 hover:bg-pink-100/70 text-slate-700 border border-pink-200/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setExpirationSetting('custom')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all text-center cursor-pointer col-span-3 sm:col-span-1 ${
                    expirationSetting === 'custom'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs font-semibold'
                      : 'bg-pink-50/60 hover:bg-pink-100/70 text-slate-700 border border-pink-200/50'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Date & Time Picker */}
              {expirationSetting === 'custom' && (
                <div className="pt-2 border-t border-pink-100 space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Choose Exact Expiration Date &amp; Time (Local Timezone)
                  </label>
                  <input
                    type="datetime-local"
                    min={minCustomDateTime}
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-pink-200 rounded-xl bg-pink-50/30 focus:outline-pink-500"
                  />
                </div>
              )}

              {/* Calculated Expiration Preview with Local Timezone */}
              <div className="p-2.5 rounded-xl bg-pink-50/60 text-xs text-slate-700 flex items-start gap-2 border border-pink-100">
                <Calendar className="w-3.5 h-3.5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Link expires: </span>
                  <span className="text-pink-700 font-medium">
                    {previewExpiresAt ? formatExpirationDisplay(previewExpiresAt) : 'Never expires (Permanent)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Sparkles className="w-4 h-4 text-pink-500" />
                What happens when you publish?
              </div>
              <p>• Your gift gets a unique link and scannable QR code.</p>
              <p>• When the expiration timestamp is reached, public access is automatically disabled.</p>
              <p>• As the creator, your draft and photos are never deleted—you can extend or renew availability anytime!</p>
            </div>

            <button
              onClick={handleStartPublish}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 group text-base disabled:opacity-60"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Publish &amp; Generate Shareable Link</span>
            </button>
          </div>
        )}

        {/* STATE 2: PUBLISHING IN PROGRESS */}
        {status === 'publishing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto" />
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Sealing your digital gift...</h3>
              <p className="text-xs text-slate-500 mt-1">
                Optimizing photos, setting expiration rules, and generating unique QR link.
              </p>
            </div>
          </div>
        )}

        {/* STATE 3: SUCCESS / ALREADY PUBLISHED */}
        {(status === 'success' || (status === 'idle' && shareUrl)) && (
          <div className="space-y-5">
            {/* Expiration Status Badge Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isExpired
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2">
                {isExpired ? (
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {isExpired ? 'Link Status: Expired' : 'Link Status: Active'}
                  </span>
                  <div className="text-[11px] text-slate-600">
                    {isExpired
                      ? `Expired on ${formatExpirationDisplay(currentExpiresAt)}`
                      : `Expires: ${formatExpirationDisplay(currentExpiresAt)} (${getRemainingTimeText(currentExpiresAt)})`}
                  </div>
                </div>
              </div>
            </div>

            {/* Share Link Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Public Recipient Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 text-xs sm:text-sm text-slate-700 font-mono select-all focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code and Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-tr from-pink-50/80 via-white to-rose-50/50 border border-pink-200/80">
              {/* QR Code Canvas */}
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-pink-100 flex items-center justify-center shrink-0">
                <canvas ref={canvasRef} className="w-36 h-36 max-w-full" />
              </div>

              {/* QR Code description & downloads */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-semibold text-slate-800 text-sm">
                    <QrCode className="w-4 h-4 text-pink-600" />
                    <span>Printable Surprise QR Code</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Print this QR code on a card, letter, cake box, or sticker. When scanned, it immediately opens the gift!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    onClick={handleDownloadQr}
                    className="px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-pink-500" />
                    <span>Download QR Card (PNG)</span>
                  </button>

                  <button
                    onClick={handleOpenGift}
                    className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-pink-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Gift View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* EXTEND OR RENEW AVAILABILITY SECTION */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-pink-600" />
                  <span>{isExpired ? 'Renew Expired Link' : 'Extend Link Expiration'}</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Preserves same link &amp; QR code
                </span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {EXPIRATION_OPTIONS.filter((o) => o.id !== 'custom').map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExpirationSetting(opt.id)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                      expirationSetting === opt.id
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-pink-100/70 text-slate-700 border border-pink-200/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setExpirationSetting('custom')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium transition-all text-center cursor-pointer col-span-3 sm:col-span-1 ${
                    expirationSetting === 'custom'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs font-semibold'
                      : 'bg-white hover:bg-pink-100/70 text-slate-700 border border-pink-200/60'
                  }`}
                >
                  Custom
                </button>
              </div>

              {expirationSetting === 'custom' && (
                <div className="pt-2 border-t border-pink-200/60 space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-600">
                    New Expiration Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    min={minCustomDateTime}
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-pink-200 rounded-xl bg-white focus:outline-pink-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleRenewGift}
                disabled={isRenewing}
                className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
              >
                {isRenewing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>
                  {isExpired
                    ? 'Renew & Reactivate Gift Link'
                    : `Extend Expiration (to ${previewExpiresAt ? formatExpirationDisplay(previewExpiresAt).split(',')[0] : 'Permanent'})`}
                </span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                <span>Gift ID: <code className="font-mono text-pink-700">{giftId}</code></span>
              </span>
              <button
                onClick={handleStartPublish}
                disabled={isSubmitting}
                className="text-pink-600 hover:text-pink-800 font-medium underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Save New Scrapbook Edits to Link</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
