'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Volume2, Power, Lock, Sparkles, KeyRound } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';

const LockDoodleIcon = () => (
  <svg className="w-10 h-10 text-[#2d2a26]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="3" fill="#fef08a" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="#2d2a26" />
  </svg>
);

export function LockScreen() {
  const { isLocked, unlockScreen, wallpaper, showConfirm, themeMode, profile } = useOSStore();
  const { time, fullDate } = useDateTime();
  const isDark = themeMode === 'dark';

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
    if (isDark) {
      switch (wallpaper) {
        case 'sunset':
          return 'bg-[#2a1215] text-slate-100';
        case 'emerald':
          return 'bg-[#092017] text-slate-100';
        case 'cyberpunk':
          return 'bg-[#22102b] text-slate-100';
        case 'default':
        default:
          return 'bg-[#181716] text-slate-100';
      }
    } else {
      switch (wallpaper) {
        case 'sunset':
          return 'bg-[#fff1f2] text-[#2d2a26]';
        case 'emerald':
          return 'bg-[#ecfdf5] text-[#2d2a26]';
        case 'cyberpunk':
          return 'bg-[#f5f3ff] text-[#2d2a26]';
        case 'default':
        default:
          return 'bg-[#fefce8] text-[#2d2a26]';
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={isExiting ? { y: '-100vh', opacity: 0.2 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.1, 0.9, 0.2, 1] }}
      onClick={handleUnlock}
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none z-[99999] cursor-pointer flex flex-col justify-between p-6 sm:p-12 font-doodle bg-doodle-grid transition-colors duration-300 ${getWallpaperClass()}`}
    >
      {/* Background Dimming & Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDark ? 'bg-black/40 backdrop-blur-[3px]' : 'bg-amber-900/5 backdrop-blur-[1px]'
      }`} />

      {/* Decorative Floating Background Doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none overflow-hidden">
        <div className="absolute top-16 right-20 text-3xl font-doodle">✨</div>
        <div className="absolute top-1/3 left-16 text-4xl text-amber-600 font-doodle">✦</div>
        <div className="absolute bottom-32 right-1/3 text-2xl text-rose-500 font-doodle">✏️</div>
        <div className="absolute bottom-20 left-20 text-3xl text-sky-600 font-doodle">★</div>
      </div>

      {/* Top Date & Time Display */}
      <div className="relative z-10 flex flex-col items-center mt-12 sm:mt-16 text-center pointer-events-none">
        <span className={`text-7xl sm:text-9xl font-black font-doodle tracking-tight select-none ${
          isDark 
            ? 'text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]' 
            : 'text-[#2d2a26] drop-shadow-[4px_4px_0px_#fef08a]'
        }`}>
          {time ? time.split(' ')[0] : '12:00'}
        </span>
        <span className={`text-base sm:text-xl font-extrabold tracking-wide mt-3 px-4 py-1 rounded-full border-2 border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] ${
          isDark 
            ? 'bg-zinc-900/90 text-amber-300' 
            : 'bg-[#fffdfa] text-amber-950'
        }`}>
          🗓 {fullDate || 'Monday, June 29'}
        </span>
      </div>

      {/* Center User Profile & Unlock Prompt */}
      <div className="relative z-10 flex flex-col items-center gap-4 mb-6 pointer-events-none">
        {/* Cute Doodle Lock Avatar */}
        <div className={`p-4 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex items-center justify-center ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fffdfa]'
        }`}>
          <LockDoodleIcon />
        </div>

        <div className="text-center">
          <h3 className={`text-lg sm:text-xl font-extrabold tracking-wide ${
            isDark ? 'text-slate-100' : 'text-[#2d2a26]'
          }`}>
            {profile?.name || 'Aura Developer'}
          </h3>
          <p className={`text-xs font-mono font-bold mt-0.5 ${
            isDark ? 'text-slate-400' : 'text-zinc-600'
          }`}>
            {profile?.title || 'System Owner'} • Protected Workstation
          </p>
        </div>

        {/* Click to Unlock Pill */}
        <div className={`px-6 py-2.5 rounded-full border-[2.5px] border-[#2d2a26] text-xs font-extrabold tracking-wider uppercase animate-bounce shadow-[4px_4px_0px_0px_#2d2a26] flex items-center gap-2 ${
          isDark 
            ? 'bg-[#fef08a] text-[#2d2a26]' 
            : 'bg-[#fef08a] text-[#2d2a26]'
        }`}>
          <KeyRound className="w-4 h-4 text-[#2d2a26]" />
          <span>✦ Klik di mana saja untuk Membuka Lockscreen ✦</span>
        </div>
      </div>

      {/* Bottom Status Tray */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 w-full border-t-2 border-[#2d2a26] pt-4">
        {/* Left System Info */}
        <div className={`text-xs font-mono font-bold flex items-center gap-2 ${
          isDark ? 'text-slate-300' : 'text-[#2d2a26]'
        }`}>
          <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-[1px_1px_0px_0px_#2d2a26]">
            SECURE
          </span>
          <span>AuraOS v1.0.0 Workstation</span>
        </div>

        {/* Bottom Right Controls Tray */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] text-xs font-mono font-bold ${
            isDark ? 'bg-zinc-900 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'
          }`}>
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              showConfirm(
                'Power Options',
                'Restart simulated environment?',
                () => {
                  window.location.reload();
                }
              );
            }}
            className={`p-2 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26] ${
              isDark 
                ? 'bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white' 
                : 'bg-rose-200 hover:bg-rose-300 text-rose-900'
            }`} 
            title="Restart System"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
