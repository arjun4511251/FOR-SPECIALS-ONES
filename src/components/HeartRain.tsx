import React, { useMemo } from 'react';

interface HeartParticle {
  id: number;
  emoji: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  swayX: string;
  swayRot: string;
  opacity: number;
}

const ROMANTIC_HEART_EMOJIS = [
  '💖', // sparkling pink heart
  '💕', // two hearts
  '💗', // growing heart
  '💓', // beating heart
  '🌸', // cherry blossom
  '💝', // heart with ribbon
  '✨', // sparkles
  '❤️', // classic red heart
  '🌷', // tulip
  '🎀', // cute ribbon
];

export const HeartRain: React.FC = () => {
  // Pre-generate 36 varied falling heart emoji particles with deterministic distribution
  const heartRainDrops = useMemo<HeartParticle[]>(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      // Evenly distribute horizontally with small organic offsets
      const left = ((i * 2.82 + (i % 7) * 1.6) % 96) + 2;

      // Gentle, serene falling durations between 11s and 19s
      const duration = 11 + (i % 8) * 1.1;

      // Negative delays distribute hearts across the entire screen height immediately upon mount
      const delay = -((i * 1.65) % duration);

      // Subtle horizontal flutter sway and rotation
      const swayDirection = i % 2 === 0 ? 1 : -1;
      const swayX = swayDirection * (14 + (i % 6) * 3);
      const swayRot = swayDirection * (12 + (i % 5) * 4);

      // Small, delicate emoji sizes (13px to 21px)
      const size = 13 + (i % 5) * 1.8;

      // Gentle transparency layers for visual depth
      const opacity = 0.38 + (i % 4) * 0.11;

      const emoji = ROMANTIC_HEART_EMOJIS[i % ROMANTIC_HEART_EMOJIS.length];

      return {
        id: i,
        emoji,
        left: `${left}%`,
        size,
        duration: `${duration.toFixed(2)}s`,
        delay: `${delay.toFixed(2)}s`,
        swayX: `${swayX}px`,
        swayRot: `${swayRot}deg`,
        opacity,
      };
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {heartRainDrops.map((heart) => (
        <span
          key={heart.id}
          className="absolute top-0 animate-heart-rain inline-block drop-shadow-xs"
          style={
            {
              left: heart.left,
              fontSize: `${heart.size}px`,
              '--rain-duration': heart.duration,
              '--rain-opacity': heart.opacity,
              '--sway-x': heart.swayX,
              '--sway-rot': heart.swayRot,
              animationDelay: heart.delay,
              filter: 'drop-shadow(0 1px 2px rgba(244, 63, 104, 0.2))',
            } as React.CSSProperties
          }
        >
          {heart.emoji}
        </span>
      ))}
    </div>
  );
};
