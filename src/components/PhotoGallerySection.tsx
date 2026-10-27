import React, { useState, useEffect, useRef } from 'react';
import { PhotoItem } from '../types/scrapbook';
import { RotateCw, X, Image as ImageIcon, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';
import { ScrollFadeUp } from '../hooks/useScrollAnimation';

interface PhotoGallerySectionProps {
  photos: PhotoItem[];
  onAddPhoto?: (newPhoto: PhotoItem) => void;
  onEditPhotos?: () => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  photos,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeModalPhoto, setActiveModalPhoto] = useState<PhotoItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Safely clamp currentIndex if photos length changes
  const safeIndex = photos.length > 0 ? currentIndex % photos.length : 0;
  const currentPhoto = photos[safeIndex];

  // Auto-cycle through photos every 5 seconds
  useEffect(() => {
    if (!isPlaying || isHovered || activeModalPhoto !== null || photos.length <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
      setProgressKey((prev) => prev + 1);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isHovered, activeModalPhoto, photos.length, safeIndex]);

  const goToNext = () => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setProgressKey((prev) => prev + 1);
  };

  const goToPrev = () => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setProgressKey((prev) => prev + 1);
  };

  const selectPhoto = (index: number) => {
    setCurrentIndex(index);
    setProgressKey((prev) => prev + 1);
  };

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  const isCurrentFlipped = currentPhoto ? !!flippedCards[currentPhoto.id] : false;

  return (
    <section id="polaroids" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      {/* Scroll-Triggered Section Header via IntersectionObserver */}
      <ScrollFadeUp distance={24} delay={0} className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2">
          <span>Our Little Snapshots</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            Auto-cycling every 5s
          </span>
          <span aria-hidden="true">·</span>
          <span>{safeIndex + 1} of {photos.length}</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Captured Moments of Us
        </h2>
        <p className="font-handwriting text-xl text-pink-600 mt-1">
          Every snapshot holds a thousand butterflies
        </p>
      </ScrollFadeUp>

      {/* Dynamic Spotlight Carousel with IntersectionObserver Reveal */}
      <ScrollFadeUp
        distance={22}
        delay={60}
        scale={0.98}
        className="max-w-2xl mx-auto mb-14"
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            {/* Glassmorphic 5-second Progress Bar */}
            <div className="w-full bg-white/40 backdrop-blur-xs border border-white/60 h-2 rounded-full overflow-hidden mb-4 shadow-inner">
              <div
                key={progressKey}
                className={`h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-xs ${
                  isPlaying && !isHovered && activeModalPhoto === null
                    ? 'transition-all duration-[5000ms] ease-linear w-full'
                    : 'w-0'
                }`}
                style={{
                  width: isPlaying && !isHovered && activeModalPhoto === null ? '100%' : '0%',
                }}
              />
            </div>

            {/* Spotlight Polaroid Frame with Glassmorphism */}
            <div
              className="relative glass-panel p-5 sm:p-7 pb-8 sm:pb-10 rounded-3xl shadow-2xl transition-all duration-500 cursor-pointer group hover:shadow-rose-500/20"
              style={{
                transform: `rotate(${safeIndex % 2 === 0 ? '-1deg' : '1.5deg'})`,
              }}
              onClick={() => setActiveModalPhoto(currentPhoto)}
            >
              {/* Top Washi Tape */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape-pink w-32 h-7 rounded-xs shadow-xs z-20"></div>

              {!isCurrentFlipped ? (
                <div>
                  {/* Photo Display with key-based smooth fade-in */}
                  <div
                    key={currentPhoto.id}
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/40 border border-white/60 shadow-inner flex items-center justify-center animate-fade-in"
                  >
                    <img
                      src={currentPhoto.url}
                      alt={currentPhoto.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-tr from-pink-100 to-rose-50 text-pink-400 p-4 text-center">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-sm font-medium">{currentPhoto.caption}</span>
                    </div>

                    {/* Gentle hover prompt */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium backdrop-blur-xs">
                      <span>Click to view full photo</span>
                    </div>
                  </div>

                  {/* Caption & Secret Note preview */}
                  <div className="pt-5 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-handwriting text-2xl sm:text-3xl text-slate-800 leading-snug">
                        {currentPhoto.caption}
                      </p>
                      {currentPhoto.date && (
                        <p className="text-xs text-pink-600 font-medium mt-1">
                          {currentPhoto.date}
                        </p>
                      )}
                      {currentPhoto.note && (
                        <p className="text-xs text-slate-600 font-handwriting text-lg mt-2 line-clamp-2">
                          💌 &ldquo;{currentPhoto.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => toggleFlip(currentPhoto.id, e)}
                      title="Flip to read full secret note"
                      className="p-2 rounded-xl glass-button text-pink-700 shrink-0 cursor-pointer flex items-center gap-1 text-xs font-medium"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span className="hidden sm:inline">Flip note</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Flipped back of spotlight polaroid */
                <div className="min-h-[300px] flex flex-col justify-between p-6 scrapbook-paper rounded-2xl border border-white/60 animate-fade-in">
                  <div>
                    <div className="flex items-center justify-between text-xs text-pink-600 mb-4 border-b border-pink-200/60 pb-2">
                      <span className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Secret Scrapbook Note
                      </span>
                      <span>{currentPhoto.date || 'Sweet Memory'}</span>
                    </div>
                    <p className="font-handwriting text-2xl sm:text-3xl text-slate-700 leading-relaxed">
                      {currentPhoto.note || 'You make every ordinary moment feel completely extraordinary.'}
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={(e) => toggleFlip(currentPhoto.id, e)}
                      className="px-3.5 py-1.5 rounded-xl glass-button text-pink-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Flip back to photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Left Arrow Navigation with Glassmorphism */}
            <button
              onClick={goToPrev}
              aria-label="Previous photo"
              className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-panel-subtle shadow-lg flex items-center justify-center text-slate-700 hover:text-pink-600 hover:scale-105 active:scale-95 transition-all cursor-pointer z-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Arrow Navigation with Glassmorphism */}
            <button
              onClick={goToNext}
              aria-label="Next photo"
              className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-panel-subtle shadow-lg flex items-center justify-center text-slate-700 hover:text-pink-600 hover:scale-105 active:scale-95 transition-all cursor-pointer z-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Carousel Play/Pause and Indicators */}
          <div className="mt-5 flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause auto-cycle' : 'Play 5-second auto-cycle'}
                className="px-2.5 py-1.5 rounded-xl glass-panel-subtle text-slate-700 hover:text-pink-600 transition-colors flex items-center gap-1 text-xs cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-pink-600" />
                    <span>Pause (5s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 ml-0.5 text-pink-600" />
                    <span>Auto-Play (5s)</span>
                  </>
                )}
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center gap-1.5">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPhoto(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    safeIndex === idx
                      ? 'w-6 h-2.5 bg-pink-500 shadow-xs'
                      : 'w-2.5 h-2.5 bg-white/60 backdrop-blur-xs border border-white/70 hover:bg-pink-300'
                  }`}
                />
              ))}
            </div>

            <div className="text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-full glass-panel-subtle">
              {isHovered ? 'Paused on hover' : 'Cycles every 5s'}
            </div>
          </div>
        </div>
      </ScrollFadeUp>

      {/* Polaroid Gallery Grid with Staggered IntersectionObserver Reveal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-stretch">
        {photos.map((photo, index) => {
          const isFlipped = !!flippedCards[photo.id];
          const isSelected = safeIndex === index;
          const tapeStyle = index % 3 === 0 ? 'washi-tape-pink' : index % 3 === 1 ? 'washi-tape-gold' : 'washi-tape-mint';
          const defaultTilt = photo.rotation ?? (index % 2 === 0 ? -2 : 2);

          return (
            <ScrollFadeUp
              key={photo.id}
              staggerIndex={index % 6}
              staggerInterval={80}
              distance={24}
              scale={0.96}
              className="h-full"
            >
              <div
                className={`relative group transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full ${
                  isSelected ? 'ring-2 ring-pink-400 ring-offset-4 rounded-lg scale-[1.01]' : ''
                }`}
                style={{ transform: `rotate(${defaultTilt}deg)` }}
                onClick={() => {
                  selectPhoto(index);
                  setActiveModalPhoto(photo);
                }}
              >
                {/* Top Washi Tape Strip */}
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${tapeStyle} w-24 h-6 rounded-xs shadow-xs z-20`}
                ></div>

                {/* Active Indicator Tag */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-20 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>Now Showing</span>
                  </div>
                )}

                {/* Polaroid Frame with Glassmorphism */}
                <div className="glass-panel-subtle hover:bg-white/60 p-4 pb-6 rounded-2xl shadow-lg hover:shadow-2xl border border-white/60 transition-all duration-300 flex flex-col h-full min-h-[380px]">
                  {/* Photo or Flipped Note */}
                  {!isFlipped ? (
                    <div className="flex-1 flex flex-col">
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/40 border border-white/50 flex items-center justify-center">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-tr from-pink-100 to-rose-50 text-pink-400 p-4 text-center">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-xs font-medium">{photo.caption}</span>
                        </div>
                      </div>

                      {/* Polaroid Bottom Caption Area */}
                      <div className="pt-4 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-handwriting text-2xl text-slate-800 leading-tight">
                            {photo.caption}
                          </p>
                          {photo.date && (
                            <p className="text-xs text-pink-700/80 font-medium mt-1">
                              {photo.date}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => toggleFlip(photo.id, e)}
                          title="Flip polaroid"
                          className="p-1.5 rounded-full hover:bg-white/70 text-pink-600 transition-colors shrink-0 cursor-pointer"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Flipped Back of Polaroid */
                    <div className="flex-1 flex flex-col justify-between p-4 scrapbook-paper rounded-xl border border-white/60">
                      <div>
                        <div className="flex items-center justify-between text-xs text-pink-600 mb-3 border-b border-pink-200/50 pb-1">
                          <span className="font-medium">Secret Note</span>
                          <span>{photo.date || 'Sweet Memory'}</span>
                        </div>
                        <p className="font-handwriting text-2xl text-slate-700 leading-relaxed">
                          {photo.note || 'You make every ordinary moment feel completely extraordinary.'}
                        </p>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={(e) => toggleFlip(photo.id, e)}
                          className="text-xs text-pink-600 hover:text-pink-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Flip back</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollFadeUp>
          );
        })}
      </div>

      {/* Enlarge Polaroid Lightbox Modal with Deep Glassmorphism */}
      {activeModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveModalPhoto(null)}
        >
          <div
            className="glass-panel-deep p-6 pb-8 rounded-3xl max-w-lg w-full shadow-2xl relative cursor-default border border-white/80 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalPhoto(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-white/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="rounded-2xl overflow-hidden bg-white/40 border border-white/50 max-h-[65vh] flex items-center justify-center">
              <img
                src={activeModalPhoto.url}
                alt={activeModalPhoto.caption}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[65vh]"
              />
            </div>
            <div className="mt-4">
              <h4 className="font-handwriting text-3xl text-slate-800">
                {activeModalPhoto.caption}
              </h4>
              {activeModalPhoto.date && (
                <p className="text-xs text-pink-700/80 font-medium mt-1">{activeModalPhoto.date}</p>
              )}
              {activeModalPhoto.note && (
                <p className="mt-2 text-sm text-slate-700 font-handwriting text-xl glass-panel-subtle p-3 rounded-2xl border border-white/60">
                  💌 {activeModalPhoto.note}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
