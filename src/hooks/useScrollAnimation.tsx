import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface UseScrollAnimationOptions<T extends HTMLElement = HTMLDivElement> {
  /**
   * Optional external React ref to target. If omitted, the hook creates and returns its own ref.
   */
  targetRef?: React.RefObject<T | null>;
  /**
   * The percentage of the target element's visibility required before triggering.
   * Default: 0.12 (12%)
   */
  threshold?: number | number[];
  /**
   * Margin around the root. Default: '0px 0px -30px 0px' (triggers slightly before/at entry)
   */
  rootMargin?: string;
  /**
   * Base delay in milliseconds before transition starts.
   * Default: 0
   */
  delay?: number;
  /**
   * Stagger index for child sequences (e.g. 0, 1, 2, ...).
   * Computed total delay = delay + (staggerIndex * staggerInterval).
   * Default: 0
   */
  staggerIndex?: number;
  /**
   * Milliseconds between consecutive staggered items.
   * Default: 80
   */
  staggerInterval?: number;
  /**
   * If true, the element animates once and remains visible.
   * If false, it re-animates smoothly upon scrolling back into view.
   * Default: false (enables fluid re-entry when scrolling up and down)
   */
  once?: boolean;
  /**
   * Transition duration in milliseconds.
   * Default: 650
   */
  duration?: number;
  /**
   * Vertical entrance distance in pixels.
   * Default: 28
   */
  distance?: number;
  /**
   * Entrance direction: 'up' | 'down' | 'left' | 'right' | 'none'.
   * Default: 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /**
   * Subtle initial scale factor (e.g. 0.96 for delicate pop-in, 1 for none).
   * Default: 1
   */
  scale?: number;
  /**
   * CSS easing function.
   * Default: 'cubic-bezier(0.22, 1, 0.36, 1)' (cinematic ease-out)
   */
  easing?: string;
}

export interface UseScrollAnimationReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  isVisible: boolean;
  hasAnimated: boolean;
  style: React.CSSProperties;
  className: string;
}

/**
 * Custom hook to detect if user has requested reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // Fallback for older Safari / browsers
      (mediaQueryList as any).addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        (mediaQueryList as any).removeListener(listener);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Custom React hook using IntersectionObserver to trigger smooth, accessible scroll animations.
 * Supports entry/exit visibility, configurable delay & stagger, and prefers-reduced-motion.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions<T> = {}
): UseScrollAnimationReturn<T> {
  const {
    targetRef,
    threshold = 0.12,
    rootMargin = '0px 0px -30px 0px',
    delay = 0,
    staggerIndex = 0,
    staggerInterval = 80,
    once = false,
    duration = 650,
    distance = 28,
    direction = 'up',
    scale = 1,
    easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  } = options;

  const internalRef = useRef<T | null>(null);
  const ref = targetRef || internalRef;
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate total delay in milliseconds
  const totalDelay = Math.max(0, delay + staggerIndex * staggerInterval);

  useEffect(() => {
    // If reduced motion is requested, immediately mark as visible with no motion
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments lacking IntersectionObserver
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          // Re-trigger animation cleanly when scrolling back out and in
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, prefersReducedMotion]);

  // Compute transform offset string based on direction and scale
  const getTransform = (): string => {
    if (prefersReducedMotion) return 'none';
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';

    let translate = 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        translate = `translate3d(0, ${distance}px, 0)`;
        break;
      case 'down':
        translate = `translate3d(0, -${distance}px, 0)`;
        break;
      case 'left':
        translate = `translate3d(-${distance}px, 0, 0)`;
        break;
      case 'right':
        translate = `translate3d(${distance}px, 0, 0)`;
        break;
      case 'none':
      default:
        translate = 'translate3d(0, 0, 0)';
        break;
    }

    if (scale !== 1) {
      return `${translate} scale(${scale})`;
    }
    return translate;
  };

  const style: React.CSSProperties = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        opacity: 1,
        transform: 'none',
        transition: 'none',
      };
    }

    const activeDelay = isVisible ? totalDelay : 0;

    return {
      opacity: isVisible ? 1 : 0,
      transform: getTransform(),
      transitionProperty: 'opacity, transform',
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: easing,
      transitionDelay: `${activeDelay}ms`,
      willChange: isVisible ? 'auto' : 'opacity, transform',
    };
  }, [isVisible, totalDelay, duration, easing, direction, distance, scale, prefersReducedMotion]);

  const className = `transition-all ${isVisible ? 'opacity-100' : 'opacity-0'}`;

  return {
    ref,
    isVisible,
    hasAnimated,
    style,
    className,
  };
}

/**
 * Reusable component wrapper for smooth IntersectionObserver fade-up scroll animations.
 */
export interface ScrollFadeUpProps extends React.HTMLAttributes<HTMLDivElement>, UseScrollAnimationOptions {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const ScrollFadeUp: React.FC<ScrollFadeUpProps> = ({
  children,
  as: Component = 'div',
  threshold,
  rootMargin,
  delay,
  staggerIndex,
  staggerInterval,
  once,
  duration,
  distance,
  direction,
  scale,
  easing,
  className = '',
  style: customStyle,
  ...rest
}) => {
  const { ref, style } = useScrollAnimation({
    threshold,
    rootMargin,
    delay,
    staggerIndex,
    staggerInterval,
    once,
    duration,
    distance,
    direction,
    scale,
    easing,
  });

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...customStyle,
  };

  const Tag = Component as any;

  return (
    <Tag ref={ref} style={mergedStyle} className={className} {...rest}>
      {children}
    </Tag>
  );
};
