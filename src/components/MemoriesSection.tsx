import React, { useState } from 'react';
import { MemoryItem } from '../types/scrapbook';
import {
  Heart,
  MapPin,
  Calendar,
  X,
  Maximize2,
} from 'lucide-react';
import { ScrollFadeUp } from '../hooks/useScrollAnimation';

export interface MemoriesSectionProps {
  memories: MemoryItem[];
  onAddMemory?: (memory: MemoryItem) => void;
  onUpdateMemory?: (memoryId: string, updates: Partial<MemoryItem>) => void;
  onDeleteMemory?: (memoryId: string) => void;
  onEditMemories?: () => void;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  memories,
}) => {
  // Lightbox preview for full photo
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    url: string;
    title: string;
    story?: string;
  } | null>(null);

  return (
    <section id="memories" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-20">
      {/* Scroll-Triggered Section Header via IntersectionObserver */}
      <ScrollFadeUp distance={24} delay={0} className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2">
          <span>Our Story So Far</span>
          <span aria-hidden="true">·</span>
          <span>Chapter by chapter</span>
          <span aria-hidden="true">·</span>
          <span>Cherished moments</span>
        </div>
        <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Favorite Little Memories
        </h2>
        <p className="font-handwriting text-xl text-pink-600 mt-1">
          The quiet moments I wouldn&apos;t trade for anything
        </p>
      </ScrollFadeUp>

      {/* Timeline / Notebook Scrapbook Cards with Staggered IntersectionObserver Reveal */}
      <div className="space-y-8 sm:space-y-12 relative before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-pink-200/70 before:-translate-x-1/2 before:hidden sm:before:block">
        {memories.map((memory, index) => {
          const isEven = index % 2 === 0;

          return (
            <ScrollFadeUp
              key={memory.id}
              direction={isEven ? 'left' : 'right'}
              distance={26}
              staggerIndex={index % 4}
              staggerInterval={90}
              duration={650}
              className={`relative flex flex-col sm:flex-row items-center gap-6 sm:gap-12 ${
                isEven ? 'sm:flex-row-reverse' : ''
              }`}
            >
              {/* Center Heart Pin on Desktop */}
              <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full glass-panel-subtle border-2 border-pink-400 items-center justify-center z-10 shadow-md">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>

              {/* Memory Card with Glassmorphism & Subtle Depth */}
              <div className="w-full sm:w-[calc(50%-2rem)] glass-panel rounded-3xl p-6 sm:p-7 shadow-xl border border-white/70 scrapbook-paper relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group">
                {/* Washi tape accent */}
                <div
                  className={`absolute -top-3 ${
                    isEven ? 'left-6 washi-tape-gold' : 'right-6 washi-tape-pink'
                  } w-20 h-5 rounded-xs`}
                ></div>

                {/* Card Header Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-pink-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{memory.date}</span>
                    </span>
                    {memory.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{memory.location}</span>
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="text-pink-600 font-semibold">{memory.tag}</span>
                  </div>
                </div>

                <h3 className="font-serif-romantic text-xl font-bold text-slate-900 mb-2">
                  {memory.title}
                </h3>

                <p className="text-sm text-slate-700 leading-relaxed font-sans mb-3">
                  {memory.story}
                </p>

                {/* Memory Photo (Clean Display with Lightbox Preview) */}
                {memory.photoUrl && (
                  <div
                    onClick={() =>
                      setLightboxPhoto({
                        url: memory.photoUrl!,
                        title: memory.title,
                        story: memory.story,
                      })
                    }
                    className="mt-3 relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/70 bg-white/40 shadow-md group/img cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                    title="Click to view photo"
                  >
                    <img
                      src={memory.photoUrl}
                      alt={memory.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />

                    {/* Subtle View Hint on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-[11px] text-white/90 font-medium flex items-center gap-1.5 drop-shadow-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View photo</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollFadeUp>
          );
        })}
      </div>

      {/* FULL LIGHTBOX PREVIEW MODAL */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="max-w-3xl w-full glass-panel-deep rounded-3xl overflow-hidden p-4 relative shadow-2xl border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="rounded-2xl overflow-hidden max-h-[75vh] flex items-center justify-center bg-black/40">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-4 text-center">
              <h4 className="font-serif-romantic text-xl font-bold text-slate-900">
                {lightboxPhoto.title}
              </h4>
              {lightboxPhoto.story && (
                <p className="text-xs text-slate-600 max-w-xl mx-auto mt-1">
                  {lightboxPhoto.story}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
