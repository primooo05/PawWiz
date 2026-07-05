import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface PageTransitionProps {
  /** Unique key per route so AnimatePresence can swap views. */
  routeKey: string;
  children: ReactNode;
}

/**
 * Neo-Brutalist route transition.
 *
 * Bold and snappy: the incoming page pops up from a slight offset with a
 * hard spring, the outgoing page drops away. This keeps the chunky,
 * high-energy feel of the design system rather than a soft fade.
 *
 * IMPORTANT — fixed-position children:
 * Any non-`none` `transform` (or `will-change: transform`) on an ancestor
 * turns that ancestor into the containing block for `position: fixed`
 * descendants. Pages here render a `fixed` BottomNav, so we must NOT leave a
 * transform on the wrapper once the page has settled — otherwise the bottom
 * nav detaches from the viewport. We therefore clear the inline transform /
 * will-change the moment the enter animation completes, restoring native
 * `fixed` behavior at rest.
 *
 * Respects `prefers-reduced-motion` — falls back to an instant, opacity-only
 * swap (which never introduces a transform) for users who opt out of motion.
 */
export default function PageTransition({ routeKey, children }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  if (reduceMotion) {
    return (
      <motion.div
        key={routeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      key={routeKey}
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 30,
        mass: 0.8,
        opacity: { duration: 0.18 },
      }}
      style={{ transformOrigin: 'top center' }}
      onAnimationComplete={() => {
        // Drop the resting identity transform so `fixed` children (e.g. the
        // BottomNav) pin to the viewport again instead of this wrapper.
        const node = ref.current;
        if (node) {
          node.style.transform = 'none';
          node.style.willChange = 'auto';
        }
      }}
    >
      {children}
    </motion.div>
  );
}
