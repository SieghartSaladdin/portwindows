'use client';

import { useEffect } from 'react';
import { useOSStore } from '@/lib/store';

/**
 * Rehydrates persisted preferences once on mount and mirrors theme + wallpaper
 * onto <html data-theme data-wallpaper> so CSS tokens and `dark:` utilities follow the app setting.
 */
export function ThemeSync() {
  const themeMode = useOSStore((s) => s.themeMode);
  const wallpaper = useOSStore((s) => s.wallpaper);

  useEffect(() => {
    useOSStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
    root.dataset.wallpaper = wallpaper;
    root.style.colorScheme = themeMode;
  }, [themeMode, wallpaper]);

  return null;
}
