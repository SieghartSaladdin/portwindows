import { useSyncExternalStore } from 'react';

/** Subscribes to a CSS media query. Returns `false` during SSR and the first client render. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True below the `md` breakpoint (768px) — windows go full-screen, no drag/resize. */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767.98px)');
}

/** True on devices without hover (phones/tablets) — hide keyboard-only hints, use taps. */
export function useIsTouch() {
  return useMediaQuery('(hover: none)');
}
