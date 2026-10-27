import React, { useRef } from 'react';
import { Heart, Sparkles, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EASE_CINEMATIC } from './ScrollAnimations';

interface ScrapbookHeroProps {
  recipientName: string;
  senderName: string;
  romanticKicker: string;
  headline: string;
  subtext: string;
  birthdayDate: string;
}

export const ScrapbookHero: React.FC<ScrapbookHeroProps> = ({
  recipientName,
  senderName,
  romanticKicker,
  headline,
  subtext,
  birthdayDate,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Subtle restrained parallax on hero scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const tapeYLeft = useTransform(scrollYProgress, [0, 1], [0, -14]);
  const tapeYRight = useTransform(scrollYProgress, [0, 1], [0, -18]);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden scroll-mt-20"
    >
      {/* Scrapbook Glass Container */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 24, scale: 0.98 }}
        whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.75, ease: EASE_CINEMATIC }}
        className="max-w-4xl mx-auto relative glass-panel rounded-3xl p-8 sm:p-14 text-center will-change-transform"
      >
        {/* Washi tapes on corners with subtle parallax depth */}
        <motion.div
          style={shouldReduceMotion ? {} : { y: tapeYLeft }}
          className="absolute -top-3.5 left-10 washi-tape-pink w-28 h-7 -rotate-2 rounded-sm shadow-xs"
        />
        <motion.div
          style={shouldReduceMotion ? {} : { y: tapeYRight }}
          className="absolute -top-3.5 right-10 washi-tape-gold w-28 h-7 rotate-3 rounded-sm shadow-xs"
        />

        {/* Small metadata text without pill boxes */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_CINEMATIC }}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-700 mb-4 drop-shadow-xs"
        >
          <span>{romanticKicker}</span>
          <span aria-hidden="true">·</span>
          <span>Date: {birthdayDate}</span>
          <span aria-hidden="true">·</span>
          <span>From: {senderName}</span>
        </motion.div>

        {/* Main Display Headline with text reveal */}
        <motion.h1
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 18, scale: 0.97 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.65, delay: 0.18, ease: EASE_CINEMATIC }}
          className="font-serif-romantic text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-5 leading-tight text-balance drop-shadow-xs"
        >
          {headline || `Happy Birthday, ${recipientName}`}
        </motion.h1>

        {/* Cursive Subtitle */}
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_CINEMATIC }}
          className="font-handwriting text-2xl sm:text-3xl text-pink-700 mb-6 max-w-2xl mx-auto leading-relaxed font-semibold drop-shadow-xs"
        >
          &ldquo;You are my favorite thought, my sweetest adventure, and the best part of every day.&rdquo;
        </motion.p>

        {/* Body Description */}
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.32, ease: EASE_CINEMATIC }}
          className="text-base sm:text-lg text-slate-800 max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
        >
          {subtext}
        </motion.p>

        {/* Action jump links */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.55, delay: 0.4, ease: EASE_CINEMATIC }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#polaroids"
            className="px-6 py-3 rounded-xl glass-button-primary text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Our Scrapbook</span>
          </a>
          <a
            href="#surprise"
            className="px-5 py-3 rounded-xl glass-button text-rose-800 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
            <span>Go to Birthday Surprise</span>
          </a>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="#polaroids"
            aria-label="Scroll down to polaroids gallery"
            className="text-pink-500 hover:text-pink-700 transition-colors animate-bounce p-2"
          >
            <ChevronDown className="w-6 h-6" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};
