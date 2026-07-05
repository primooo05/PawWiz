import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Validates that a hash string is a safe CSS selector (simple #id format).
 * Rejects anything that isn't a '#' followed by a valid CSS identifier to
 * prevent selector injection via crafted URLs.
 */
function isSafeHash(hash: string): boolean {
  // Only allow # followed by a valid CSS identifier:
  // starts with a letter, underscore, or hyphen, then word chars and hyphens.
  return /^#[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(hash);
}

/**
 * Scrolls to a hash-targeted element after the Home page mounts.
 * Used for cross-page anchor navigation where the target element
 * may not yet be rendered when the component first mounts.
 *
 * Polls with requestAnimationFrame for up to 100ms for the target
 * element to appear in the DOM. If found, scrolls into view with
 * smooth behavior (relies on CSS scroll-margin-top for navbar offset).
 * If not found within the timeout, takes no action.
 *
 * The hash is validated against a safe pattern before being passed to
 * querySelector to prevent CSS selector injection from crafted URLs.
 */
export function useHashScroll(): void {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash || !isSafeHash(hash)) return;

    const startTime = performance.now();
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    function poll() {
      const element = document.querySelector(hash);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (performance.now() - startTime < 100) {
        rafId = requestAnimationFrame(poll);
      }
      // If 100ms elapsed and element not found, take no action
    }

    // Start polling on the next frame
    rafId = requestAnimationFrame(poll);

    // Safety timeout to stop polling after 100ms
    timeoutId = setTimeout(() => {
      cancelAnimationFrame(rafId);
    }, 100);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [hash]);
}
