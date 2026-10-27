import React, { useState, useEffect } from 'react';
import { HeartRain } from './HeartRain';

interface ClickHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  burstX: number;
  burstRot: number;
}

interface FloatingDecorationsProps {
  enabled?: boolean;
}

export const FloatingDecorations: React.FC<FloatingDecorationsProps> = ({
  enabled = true,
}) => {
  const [clickHearts, setClickHearts] = useState<ClickHeart[]>([]);

  // Spawn gentle micro-hearts upon user clicks/taps anywhere on screen
  useEffect(() => {
    let heartCounter = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // Don't spawn if user is typing in an input
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const colors = ['#f43f68', '#ec4899', '#fb7185', '#f472b6'];
      const newHearts: ClickHeart[] = Array.from({ length: 3 }).map((_, idx) => ({
        id: ++heartCounter,
        x: clientX,
        y: clientY,
        size: 13 + Math.random() * 8,
        color: colors[idx % colors.length],
        burstX: (Math.random() - 0.5) * 60,
        burstRot: (Math.random() - 0.5) * 30,
      }));

      setClickHearts((prev) => [...prev.slice(-15), ...newHearts]);

      // Remove after animation completes
      setTimeout(() => {
        setClickHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1400);
    };

    window.addEventListener('click', handlePointerDown);
    return () => window.removeEventListener('click', handlePointerDown);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Heart Rain: Small heart emojis gently drifting down from top of the screen */}
      {enabled && <HeartRain />}

      {/* Interactive Heart Particles on Tap/Click */}
      {clickHearts.map((ch) => (
        <div
          key={ch.id}
          className="fixed animate-burst-heart pointer-events-none"
          style={
            {
              left: `${ch.x}px`,
              top: `${ch.y}px`,
              width: `${ch.size}px`,
              height: `${ch.size}px`,
              '--burst-x': `${ch.burstX}px`,
              '--burst-rot': `${ch.burstRot}deg`,
            } as React.CSSProperties
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill={ch.color}
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(244, 63, 104, 0.35))' }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
};
