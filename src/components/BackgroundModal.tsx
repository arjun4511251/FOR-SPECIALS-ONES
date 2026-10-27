import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Sparkles, RotateCcw, Check, Upload, Film } from 'lucide-react';

interface BackgroundConfig {
  type: 'default' | 'image' | 'video';
  url?: string;
  enableOverlayEffects?: boolean;
}

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundConfig?: BackgroundConfig;
  onSave: (config: BackgroundConfig) => void;
}

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  backgroundConfig,
  onSave,
}) => {
  const [selectedType, setSelectedType] = useState<'default' | 'image' | 'video'>(
    backgroundConfig?.type || 'default'
  );
  const [mediaUrl, setMediaUrl] = useState<string>(backgroundConfig?.url || '');
  const [enableOverlay, setEnableOverlay] = useState<boolean>(
    backgroundConfig?.enableOverlayEffects ?? true
  );
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (type: 'image' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (warn if > 40MB for local video)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size is quite large. Recommended under 50MB for smooth browser playback.');
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaUrl(reader.result);
          setSelectedType(type);
          setPreviewError(null);
        }
      };
      reader.onerror = () => {
        setPreviewError('Failed to read file from device.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      type: selectedType,
      url: selectedType === 'default' ? undefined : mediaUrl,
      enableOverlayEffects: enableOverlay,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setSelectedType('default');
    setMediaUrl('');
    setEnableOverlay(true);
    onSave({
      type: 'default',
      enableOverlayEffects: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel-deep rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/80 scrapbook-paper relative animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-200/50 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl glass-panel-subtle flex items-center justify-center text-pink-600 shadow-xs border border-white/60">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-romantic text-xl sm:text-2xl font-bold text-slate-900">
                Background UI Settings
              </h3>
              <p className="text-xs text-slate-600">
                Set custom background image or video from your device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-white/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Preset 1: Default Romantic 3D Scene */}
          <div
            onClick={() => setSelectedType('default')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              selectedType === 'default'
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
                  Romantic River &amp; 3D Heart (Default)
                </span>
                {selectedType === 'default' && (
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
                  onChange={(e) => handleFileUpload('image', e)}
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
                  onChange={(e) => handleFileUpload('video', e)}
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
                  value={mediaUrl.startsWith('data:') ? '[File loaded from device]' : mediaUrl}
                  disabled={mediaUrl.startsWith('data:')}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value.endsWith('.mp4') || e.target.value.endsWith('.webm')) {
                      setSelectedType('video');
                    } else if (e.target.value.length > 0) {
                      setSelectedType('image');
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-white/70 bg-white/70 rounded-xl focus:bg-white focus:outline-pink-500 text-slate-800"
                />
                {mediaUrl.startsWith('data:') && (
                  <button
                    onClick={() => setMediaUrl('')}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50/70 rounded-xl cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Preview Box */}
            {selectedType !== 'default' && mediaUrl && (
              <div className="rounded-2xl overflow-hidden border border-white/60 aspect-[16/9] relative bg-slate-900 mt-2 shadow-inner">
                {selectedType === 'video' ? (
                  <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                  {selectedType === 'video' ? 'Video Loaded 🎬' : 'Image Loaded 🖼️'}
                </div>
              </div>
            )}

            {previewError && (
              <p className="text-xs text-rose-600 font-medium">{previewError}</p>
            )}
          </div>

          {/* Falling Flowers Overlay Checkbox */}
          <label className="flex items-center gap-2 p-3 rounded-2xl glass-panel-subtle border border-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={enableOverlay}
              onChange={(e) => setEnableOverlay(e.target.checked)}
              className="accent-pink-500 rounded"
            />
            <span className="text-xs text-slate-700">
              Keep falling flower petals and gentle river ripples on background
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-pink-200/50">
          <button
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-pink-600 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Scene</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 glass-button rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium text-white glass-button-primary shadow-lg shadow-pink-400/30 rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Applied!</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Apply Background</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
