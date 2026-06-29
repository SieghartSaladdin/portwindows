'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Volume2, Power } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';

export function LockScreen() {
  const { isLocked, unlockScreen, wallpaper } = useOSStore();
  const { time, date, fullDate } = useDateTime();

  const [isExiting, setIsExiting] = useState(false);

  // Sync exiting state with store locked status
  useEffect(() => {
    if (isLocked) {
      setIsExiting(false);
    }
  }, [isLocked]);

  if (!isLocked && !isExiting) return null;

  const handleUnlock = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Let the slide-up animation complete before removing from DOM
    setTimeout(() => {
      unlockScreen();
    }, 450);
  };

  const getWallpaperClass = () => {
    switch (wallpaper) {
      case 'sunset':
        return 'bg-gradient-to-tr from-zinc-950 via-neutral-900 to-rose-950';
      case 'emerald':
        return 'bg-gradient-to-tr from-stone-950 via-zinc-900 to-emerald-950';
      case 'cyberpunk':
        return 'bg-gradient-to-tr from-slate-950 via-slate-900 to-fuchsia-950';
      case 'default':
      default:
        return 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950';
    }
  };

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={isExiting ? { y: '-100vh', opacity: 0.2 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.1, 0.9, 0.2, 1] }}
      onClick={handleUnlock}
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none z-[99999] cursor-pointer flex flex-col justify-between p-12 text-white ${getWallpaperClass()}`}
    >
      {/* Background Dimming */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      {/* Top Date & Time display */}
      <div className="relative z-10 flex flex-col items-center mt-20 text-center pointer-events-none">
        <span className="text-8xl font-bold tracking-tight drop-shadow-lg font-sans">
          {time ? time.split(' ')[0] : '12:00'}
        </span>
        <span className="text-lg font-medium tracking-wide text-slate-200 mt-4 drop-shadow-md">
          {fullDate || 'Monday, June 29'}
        </span>
      </div>

      {/* Center Unlock Prompt */}
      <div className="relative z-10 flex flex-col items-center gap-3 mb-10 pointer-events-none">
        <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-slate-200 animate-pulse">
          Click anywhere to unlock
        </div>
      </div>

      {/* Bottom Status Tray */}
      <div className="relative z-10 flex items-center justify-between text-slate-300 w-full">
        {/* Left spacing */}
        <div className="text-xs text-slate-400 font-medium">
          Windows 11 Pro replica
        </div>

        {/* Bottom Right Tray */}
        <div className="flex items-center gap-5">
          <Wifi className="w-4 h-4 text-slate-300" />
          <Volume2 className="w-4 h-4 text-slate-300" />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Restart simulated environment?')) {
                window.location.reload();
              }
            }}
            className="hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-default" 
            title="Restart System"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
