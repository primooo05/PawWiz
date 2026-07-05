import { useEffect } from 'react';

let lockCount = 0;

export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    if (lockCount === 0) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);
}