import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on pathname changes where the destination
 * URL does not contain a hash fragment. Uses instant scroll behavior.
 *
 * Handles both programmatic navigation and browser back/forward.
 */
export function useScrollToTop(): void {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== previousPathname.current && !hash) {
      window.scrollTo(0, 0);
    }
    previousPathname.current = pathname;
  }, [pathname, hash]);
}
