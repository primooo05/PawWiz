import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 *
 * Attaches an IntersectionObserver to the returned ref. When the element
 * crosses the viewport threshold, sets `data-revealed="true"` on it —
 * which CSS uses to trigger `.reveal-item` stagger animations.
 *
 * @param threshold  Fraction of the element that must be visible (default 0.12)
 * @param once       If true, observer disconnects after first reveal (default true)
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  threshold = 0.12,
  once = true,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.revealed = 'true';
          if (once) observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}
