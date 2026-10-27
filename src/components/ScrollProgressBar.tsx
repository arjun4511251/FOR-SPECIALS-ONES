import React from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        style={{ scaleX }}
        className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-amber-300 origin-left shadow-sm"
      />
    </div>
  );
};
