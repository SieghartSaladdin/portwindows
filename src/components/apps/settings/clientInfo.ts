'use client';

import { useSyncExternalStore } from 'react';

/** Best-effort, human-readable browser + platform from the user agent string. */
export function describeBrowser(ua: string): { browser: string; platform: string } {
  const pick = (re: RegExp) => ua.match(re)?.[1];
  let browser = 'Unknown browser';
  let v: string | undefined;
  if ((v = pick(/Edg(?:e|A|iOS)?\/(\d+)/))) browser = `Edge ${v}`;
  else if ((v = pick(/(?:OPR|Opera)\/(\d+)/))) browser = `Opera ${v}`;
  else if ((v = pick(/SamsungBrowser\/(\d+)/))) browser = `Samsung Internet ${v}`;
  else if ((v = pick(/(?:Firefox|FxiOS)\/(\d+)/))) browser = `Firefox ${v}`;
  else if ((v = pick(/(?:Chrome|CriOS)\/(\d+)/))) browser = `Chrome ${v}`;
  else if (/Safari\//.test(ua) && (v = pick(/Version\/(\d+(?:\.\d+)?)/))) browser = `Safari ${v}`;

  let platform = 'Unknown OS';
  if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  else if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) platform = 'macOS';
  else if (/CrOS/i.test(ua)) platform = 'ChromeOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';

  return { browser, platform };
}

export interface ClientInfo {
  browser: string;
  platform: string;
  screen: string;
  viewport: string;
}

export function readClientInfo(): ClientInfo {
  if (typeof window === 'undefined') return { browser: '—', platform: '—', screen: '—', viewport: '—' };
  const { browser, platform } = describeBrowser(navigator.userAgent);
  const dpr = window.devicePixelRatio || 1;
  return {
    browser,
    platform,
    screen: `${window.screen.width} × ${window.screen.height}${dpr !== 1 ? ` @${Math.round(dpr * 100) / 100}x` : ''}`,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
  };
}

// useSyncExternalStore needs a stable snapshot, so cache by a string key.
let cachedKey = '';
let cached: ClientInfo = { browser: '—', platform: '—', screen: '—', viewport: '—' };
const SERVER_SNAPSHOT: ClientInfo = cached;

function getSnapshot(): ClientInfo {
  const next = readClientInfo();
  const key = `${next.browser}|${next.platform}|${next.screen}|${next.viewport}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cached = next;
  }
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

/** Live browser/screen info that updates on resize. */
export function useClientInfo(): ClientInfo {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}
