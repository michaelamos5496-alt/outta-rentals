import type { Transition, Variants } from "framer-motion";

/**
 * OUTTA restrained motion system.
 *
 * Mirrors the CSS timing tokens in `globals.css` (--ease-outta,
 * --duration-*) so JS-driven (Framer Motion) and CSS-driven transitions
 * feel like one system. Keep additions here deliberate — the goal is
 * "premium production company," not "AI-generated animated website."
 */

export const easeOutta: Transition["ease"] = [0.16, 1, 0.3, 1];

export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
} as const;

const transition = (d: number, delay = 0): Transition => ({
  duration: d,
  delay,
  ease: easeOutta,
});

export const fadeIn = (delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition(duration.base, delay) },
});

export const slideUp = (delay = 0, distance = 24): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition(duration.base, delay),
  },
});

export const slideIn = (delay = 0, distance = 32): Variants => ({
  hidden: { opacity: 0, x: distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition(duration.base, delay),
  },
});

export const scaleIn = (delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transition(duration.base, delay),
  },
});

/** Clip-path reveal for imagery — a signature cinematic entrance. */
export const imageReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", scale: 1.06 },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    scale: 1,
    transition: { duration: duration.slow, ease: easeOutta },
  },
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

export const viewportOnce = { once: true, margin: "-10% 0px -10% 0px" } as const;
