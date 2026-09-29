'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Power, KeyRound } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { OS_VERSION } from '@/lib/data';
import { useDateTime } from '@/hooks/useDateTime';
import { isPlaceholderProfile } from '@/hooks/useProfileLinks';
import { IconButton } from '@/components/ui/primitives';

const LockDoodleIcon = () => (
  <svg className="w-10 h-10 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="11" width="18" height="11" rx="3" className="fill-highlight" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

export function LockScreen() {
  const isLocked = useOSStore((s) => s.isLocked);
  const unlockScreen = useOSStore((s) => s.unlockScreen);
  const showConfirm = useOSStore((s) => s.showConfirm);
  const profile = useOSStore((s) => s.profile);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const { time, fullDate } = useDateTime();

  const [isExiting, setIsExiting] = useState(false);

  const handleUnlock = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    // Let the slide-up animation complete before removing from DOM
    setTimeout(() => {
      unlockScreen();
      setIsExiting(false);
    }, 450);
  }, [isExiting, unlockScreen]);

  // Enter / Space unlocks (ignored while a dialog such as the power confirm is open)
  useEffect(() => {
    if (!isLocked || isExiting) return;
    const onKey = (e: KeyboardEvent) => {
      if (useOSStore.getState().confirmDialog?.isOpen) return;
      // Let focused buttons (e.g. the power button) handle their own Enter / Space
      if ((e.target as HTMLElement | null)?.closest?.('button, input, textarea, select')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleUnlock();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLocked, isExiting, handleUnlock]);

  if (!isLocked && !isExiting) return null;

  const hasRealProfile = dataStatus === 'ready' && !isPlaceholderProfile(profile);
  const [clock, meridiem] = time ? time.split(' ') : ['', ''];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Lock screen"
      initial={{ y: 0, opacity: 1 }}
      animate={isExiting ? { y: '-100vh', opacity: 0.2 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.1, 0.9, 0.2, 1] }}
      onClick={handleUnlock}
      className="fixed inset-0 w-screen h-dvh overflow-hidden select-none z-[99999] cursor-pointer flex flex-col justify-between p-5 sm:p-12 font-doodle bg-doodle-paper text-fg"
    >
      {/* Decorative scribbles */}
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-30 select-none overflow-hidden text-fg">
        <div className="absolute top-16 right-20 text-3xl">✦</div>
        <div className="absolute top-1/3 left-16 text-4xl">✦</div>
        <div className="absolute bottom-32 right-1/3 text-2xl">★</div>
        <div className="absolute bottom-20 left-20 text-3xl">★</div>
      </div>

      {/* Date & time */}
      <div className="relative z-10 flex flex-col items-center mt-10 sm:mt-16 text-center pointer-events-none">
        <span className="text-7xl sm:text-9xl font-black tracking-tight text-fg" aria-live="off">
          {clock || ' '}
          {meridiem && <span className="text-2xl sm:text-4xl ml-2 align-top">{meridiem}</span>}
        </span>
        {fullDate && (
          <span className="text-sm sm:text-lg font-bold tracking-wide mt-3 px-4 py-1 rounded-full border-2 border-line bg-surface text-fg shadow-doodle">
            {fullDate}
          </span>
        )}
      </div>

      {/* Profile & unlock prompt */}
      <div className="relative z-10 flex flex-col items-center gap-4 mb-6 pointer-events-none">
        {hasRealProfile && profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt=""
            className="w-20 h-20 rounded-2xl border-[2.5px] border-line object-cover shadow-doodle-md bg-surface"
          />
        ) : (
          <div className="p-4 rounded-2xl border-[2.5px] border-line bg-surface shadow-doodle-md flex items-center justify-center">
            <LockDoodleIcon />
          </div>
        )}

        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-bold tracking-wide text-fg">
            {hasRealProfile ? profile.name : 'Aura OS'}
          </h1>
          {hasRealProfile && profile.title && <p className="text-xs font-bold mt-0.5 text-fg-muted">{profile.title}</p>}
        </div>

        <div className="px-5 py-2.5 rounded-full border-[2.5px] border-ink bg-highlight text-ink text-xs font-bold tracking-wide motion-safe:animate-bounce shadow-doodle-md flex items-center gap-2 text-center">
          <KeyRound className="w-4 h-4 shrink-0" aria-hidden />
          <span className="hidden [@media(hover:hover)]:inline">Click anywhere or press Enter to unlock</span>
          <span className="[@media(hover:hover)]:hidden">Tap anywhere to unlock</span>
        </div>
      </div>

      {/* Bottom tray */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 w-full border-t-2 border-line pt-4">
        <div className="text-xs font-bold flex items-center gap-2 text-fg">
          <span className="bg-highlight text-ink border-2 border-ink px-2 py-0.5 rounded-full text-2xs font-bold shadow-doodle-xs">
            v{OS_VERSION}
          </span>
          <span>Aura OS</span>
        </div>

        <IconButton
          label="Restart Aura OS"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            showConfirm('Restart Aura OS?', 'The page will reload and any unsaved changes in open windows will be lost.', () => window.location.reload(), {
              confirmLabel: 'Restart',
              tone: 'danger',
            });
          }}
        >
          <Power className="w-4 h-4" />
        </IconButton>
      </div>
    </motion.div>
  );
}
