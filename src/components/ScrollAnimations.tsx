import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const EASE_CINEMATIC = [0.22, 1, 0.36, 1] as const;
export const EASE_GENTLE = [0.16, 1, 0.3, 1] as const;

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' | 'zoom-in';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  amount?: number | 'some' | 'all';
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.65,
  distance = 24,
  className = '',
  amount = 0.08,
  once = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitial = () => {
    switch (variant) {
      case 'fade-up':
        return { opacity: 0, y: distance };
      case 'fade-in':
        return { opacity: 0 };
      case 'slide-left':
        return { opacity: 0, x: -distance };
      case 'slide-right':
        return { opacity: 0, x: distance };
      case 'scale-up':
        return { opacity: 0, scale: 0.95, y: distance * 0.5 };
      case 'zoom-in':
        return { opacity: 0, scale: 0.93 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const getAnimate = () => {
    switch (variant) {
      case 'fade-up':
        return { opacity: 1, y: 0 };
      case 'fade-in':
        return { opacity: 1 };
      case 'slide-left':
      case 'slide-right':
        return { opacity: 1, x: 0 };
      case 'scale-up':
        return { opacity: 1, scale: 1, y: 0 };
      case 'zoom-in':
        return { opacity: 1, scale: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{
        once,
        amount,
        margin: '0px 0px -20px 0px',
      }}
      transition={{
        duration,
        delay,
        ease: EASE_CINEMATIC,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollStaggerGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  amount?: number | 'some' | 'all';
  once?: boolean;
}

export const ScrollStaggerGroup: React.FC<ScrollStaggerGroupProps> = ({
  children,
  staggerDelay = 0.08,
  className = '',
  amount = 0.08,
  once = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount,
        margin: '0px 0px -20px 0px',
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.04,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollStaggerItemProps {
  children: React.ReactNode;
  variant?: 'fade-up' | 'scale-up' | 'slide-left' | 'slide-right';
  duration?: number;
  distance?: number;
  className?: string;
}

export const ScrollStaggerItem: React.FC<ScrollStaggerItemProps> = ({
  children,
  variant = 'fade-up',
  duration = 0.6,
  distance = 20,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getItemVariants = () => {
    switch (variant) {
      case 'scale-up':
        return {
          hidden: { opacity: 0, scale: 0.95, y: distance * 0.6 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration, ease: EASE_CINEMATIC },
          },
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: -distance },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, ease: EASE_CINEMATIC },
          },
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: distance },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, ease: EASE_CINEMATIC },
          },
        };
      case 'fade-up':
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, ease: EASE_CINEMATIC },
          },
        };
    }
  };

  return (
    <motion.div variants={getItemVariants()} className={className}>
      {children}
    </motion.div>
  );
};

interface ScrollHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  className?: string;
  once?: boolean;
}

export const ScrollHeading: React.FC<ScrollHeadingProps> = ({
  kicker,
  title,
  subtitle,
  className = 'text-center mb-10',
  once = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        {kicker && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2">
            {kicker}
          </div>
        )}
        <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-handwriting text-xl text-pink-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.12, margin: '0px 0px -20px 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className={className}
    >
      {kicker && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: EASE_CINEMATIC },
            },
          }}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-pink-600 mb-2"
        >
          {kicker}
        </motion.div>
      )}

      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 18, scale: 0.98 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.65, ease: EASE_CINEMATIC },
          },
        }}
        className="font-serif-romantic text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE_CINEMATIC },
            },
          }}
          className="font-handwriting text-xl text-pink-600 mt-1"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};
