'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { playTextBlip } from '@/lib/audio';

export function RobotPet() {
  const { 
    frierenConfig, 
    robotSpeech,
    setRobotSpeech, 
    isChatInputOpen, 
    setIsChatInputOpen,
    activeChatPartner,
    setActiveChatPartner,
    isThinking,
    windows,
    themeMode
  } = useOSStore();
  const isDark = themeMode === 'dark';
  const { isSpawned, scale, speechVolume } = frierenConfig;

  const isActivePartner = activeChatPartner === 'robot';
  const isInConversation = isActivePartner && (isChatInputOpen || !!robotSpeech || isThinking);

  // States
  const [position, setPosition] = useState({ x: 800, y: 300 });
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState('');
  const [isNear, setIsNear] = useState(false);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerWidth = (scale * 6) / 7;

  // Initial spawn point on left side of taskbar (slightly to the right of the edge widgets)
  useEffect(() => {
    if (isSpawned && typeof window !== 'undefined') {
      setPosition({
        x: 190,
        y: window.innerHeight - scale - 120,
      });
      setDirection('right');
    }
  }, [isSpawned, scale]);

  // Maintain position on resize
  useEffect(() => {
    if (!isSpawned || typeof window === 'undefined') return;

    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - containerWidth - 20),
        y: Math.min(prev.y, window.innerHeight - scale - 120),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSpawned, scale, containerWidth]);

  // Random floating movement loop
  useEffect(() => {
    if (!isSpawned || typeof window === 'undefined' || isInConversation) return;

    const moveRandomly = () => {
      const margin = 80;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Robot flies freely across the entire desktop screen!
      const newX = margin + Math.random() * Math.max(100, screenWidth - containerWidth - margin * 2);
      const newY = margin + Math.random() * Math.max(100, screenHeight - scale - margin * 2 - 60);

      setPosition((prev) => {
        setDirection(newX > prev.x ? 'right' : 'left');
        return { x: newX, y: newY };
      });
    };

    // Move every 6-9 seconds
    const interval = setInterval(moveRandomly, 7000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isSpawned, containerWidth, scale, isInConversation]);

  // Reactive assistant comments on OS actions
  const prevOpenStates = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!isSpawned) return;

    const currentOpenStates: Record<string, boolean> = {
      bio: !!windows.bio?.isOpen,
      projects: !!windows.projects?.isOpen,
      terminal: !!windows.terminal?.isOpen,
      settings: !!windows.settings?.isOpen,
      frieren: !!windows.frieren?.isOpen,
      admin: !!windows.admin?.isOpen,
    };

    if (isInConversation) {
      prevOpenStates.current = currentOpenStates;
      return;
    }

    // Find if any window just opened
    let openedApp: string | null = null;
    for (const key in currentOpenStates) {
      if (currentOpenStates[key] && !prevOpenStates.current[key]) {
        openedApp = key;
        break;
      }
    }

    // Update ref
    prevOpenStates.current = currentOpenStates;

    if (openedApp) {
      const assistantSpeeches: Record<string, string> = {
        bio: "Accessing biography log... Frieren's long history is stored in Bio.txt!",
        projects: "Projects database loaded! Click on any folder to view full details.",
        terminal: "Terminal shell active. Type 'help' or 'neofetch' to explore!",
        settings: "Control Panel loaded. Let me know if you need help adjusting settings!",
        frieren: "Frieren.exe character panel loaded. Let's configure the companion pets!",
        admin: "Warning: Restricted Developer Hub. Please authenticate via PIN code.",
      };

      const comment = assistantSpeeches[openedApp];
      if (comment) {
        setRobotSpeech(comment);
      }
    }
  }, [
    isSpawned,
    isInConversation,
    windows.bio?.isOpen,
    windows.projects?.isOpen,
    windows.terminal?.isOpen,
    windows.settings?.isOpen,
    windows.frieren?.isOpen,
    windows.admin?.isOpen,
    setRobotSpeech
  ]);

  // Proximity Detection Loop (10Hz)
  useEffect(() => {
    if (!isSpawned) return;

    const checkProximity = () => {
      const frierenEl = document.getElementById('frieren-pet');
      const robotEl = document.getElementById('robot-pet');
      if (frierenEl && robotEl) {
        const r1 = frierenEl.getBoundingClientRect();
        const r2 = robotEl.getBoundingClientRect();
        const c1x = r1.left + r1.width / 2;
        const c1y = r1.top + r1.height / 2;
        const c2x = r2.left + r2.width / 2;
        const c2y = r2.top + r2.height / 2;
        const dx = c1x - c2x;
        const dy = c1y - c2y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < 140; // 140px proximity
        setIsNear(near);
      } else {
        setIsNear(false);
      }
    };

    const interval = setInterval(checkProximity, 100);
    return () => clearInterval(interval);
  }, [isSpawned, isChatInputOpen, activeChatPartner, setIsChatInputOpen, setActiveChatPartner, setRobotSpeech]);

  // Listen for the "E" key press to interact when near
  useEffect(() => {
    if (!isNear || isChatInputOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setActiveChatPartner('robot');
        setIsChatInputOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNear, isChatInputOpen, setIsChatInputOpen, setActiveChatPartner]);

  // Typewriter Text Effect & Mouth Animation
  useEffect(() => {
    if (!robotSpeech) {
      setDisplayedSpeech('');
      setIsMouthOpen(false);
      return;
    }

    let animFrameId: number;

    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = null;
    }

    const charDuration = 35; // Snappy robotic speaking
    const duration = robotSpeech.length * charDuration;
    const startTime = performance.now();
    let lastCharsCount = 0;

    const updateFallback = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const charsToShow = Math.floor(progress * robotSpeech.length);

      if (charsToShow > lastCharsCount) {
        if (charsToShow % 2 === 0) {
          playTextBlip('robot', speechVolume);
        }
        lastCharsCount = charsToShow;
      }

      setDisplayedSpeech(robotSpeech.slice(0, charsToShow));

      // Toggle speaking state every 120ms
      const isSpeakingNow = Math.floor(elapsed / 120) % 2 === 0 && progress < 1;
      setIsMouthOpen(isSpeakingNow);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(updateFallback);
      } else {
        setIsMouthOpen(false);
        bubbleTimeoutRef.current = setTimeout(() => {
          setRobotSpeech(null);
          const store = useOSStore.getState();
          if (!store.isChatInputOpen) {
            store.setActiveChatPartner(null);
          }
        }, 5000);
      }
    };

    animFrameId = requestAnimationFrame(updateFallback);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    };
  }, [robotSpeech, setRobotSpeech, speechVolume]);

  if (!isSpawned) return null;


  return (
    <motion.div
      id="robot-pet"
      onClick={(e) => {
        e.stopPropagation();
        setActiveChatPartner('robot');
        setIsChatInputOpen(true);
      }}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 30,
        mass: 1.2
      }}
      style={{
        position: 'absolute',
        width: containerWidth,
        height: scale,
        zIndex: 30, // Render on top of icons grid and other pets for clicks
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      className="relative flex items-center justify-center pointer-events-auto group/robot"
    >
      {/* Interaction prompt button (shows when Frieren is near) */}
      <AnimatePresence>
        {isNear && !isChatInputOpen && !robotSpeech && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveChatPartner('robot');
              setIsChatInputOpen(true);
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
            className="absolute bottom-full mb-3 px-2.5 py-1.5 bg-zinc-950/85 border border-white/10 hover:border-blue-500/50 hover:bg-blue-950/20 text-blue-200 backdrop-blur-md rounded-lg shadow-xl text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 cursor-pointer pointer-events-auto"
            style={{
              imageRendering: 'auto',
              boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.4)'
            }}
          >
            <span className="px-1 py-0.5 bg-white/10 rounded text-[9px] border border-white/10">E</span>
            Interact
          </motion.button>
        )}
      </AnimatePresence>

      {/* Speech Bubble Overlay */}
      <AnimatePresence>
        {(robotSpeech || (isThinking && isActivePartner)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-[#fcf9f2] text-[#2d2a26] border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] rounded-2xl text-xs w-max max-w-[380px] min-w-[90px] break-words font-doodle font-bold leading-relaxed text-center z-50"
            style={{ 
              imageRendering: 'auto',
            }}
          >
            {isThinking && isActivePartner ? (
              <div className="flex items-center justify-center gap-1.5 py-1 px-2">
                <span className="w-2 h-2 bg-[#2d2a26] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[#2d2a26] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[#2d2a26] rounded-full animate-bounce" />
              </div>
            ) : (
              displayedSpeech
            )}
            {/* Doodle speech bubble pointer tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-[#2d2a26]" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#fcf9f2] -mt-[1px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Animated Robot Graphics */}
      <motion.div 
        animate={{ 
          y: [0, -4, 0],
          scaleX: direction === 'left' ? 1 : -1
        }}
        transition={{ 
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          scaleX: { duration: 0.3 }
        }}
        className="w-full h-full"
      >
        <svg viewBox="0 0 100 120" style={{ overflow: 'visible' }} className="w-full h-full drop-shadow-md select-none">
          {/* Antenna */}
          <line x1="50" y1="28" x2="50" y2="14" stroke="#2d2a26" strokeWidth="3.5" strokeLinecap="round" />
          <motion.circle 
            cx="50" 
            cy="11" 
            r="4.5" 
            fill={isActivePartner ? '#f43f5e' : isDark ? '#38bdf8' : '#fef08a'} 
            stroke="#2d2a26"
            strokeWidth="2"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Head */}
          <rect 
            x="22" 
            y="26" 
            width="56" 
            height="42" 
            rx="14" 
            fill={isDark ? '#202023' : '#fffdfa'} 
            stroke="#2d2a26" 
            strokeWidth="3.5" 
          />
          
          {/* Screen/Face */}
          <rect 
            x="28" 
            y="32" 
            width="44" 
            height="30" 
            rx="9" 
            fill={isDark ? '#0c0c0e' : '#fef08a'} 
            stroke="#2d2a26"
            strokeWidth="2"
          />
          
          {/* Face Display Matrix (Eyes & Mouth) */}
          {isThinking && isActivePartner ? (
            <>
              {/* Pulsing/Thinking LEDs */}
              <motion.circle 
                cx="40" 
                cy="44" 
                r="3.5" 
                fill={isDark ? '#38bdf8' : '#2d2a26'} 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle 
                cx="60" 
                cy="44" 
                r="3.5" 
                fill={isDark ? '#38bdf8' : '#2d2a26'} 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <motion.path 
                d="M 44 53 L 56 53" 
                stroke={isDark ? '#38bdf8' : '#2d2a26'} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          ) : isMouthOpen ? (
            <>
              {/* Speaking LEDs */}
              <path d="M 37 44 L 43 44" stroke={isDark ? '#10b981' : '#2d2a26'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 57 44 L 63 44" stroke={isDark ? '#10b981' : '#2d2a26'} strokeWidth="3" strokeLinecap="round" />
              {/* Speaking waveform */}
              <path d="M 44 52 Q 47 48 50 52 T 56 52" stroke={isDark ? '#10b981' : '#2d2a26'} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Idle screen display */}
              <circle cx="40" cy="44" r="4" fill={isDark ? '#38bdf8' : '#2d2a26'} />
              <circle cx="60" cy="44" r="4" fill={isDark ? '#38bdf8' : '#2d2a26'} />
              {/* Cute smiley smile */}
              <path d="M 45 52 Q 50 56 55 52" stroke={isDark ? '#38bdf8' : '#2d2a26'} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Neck */}
          <rect x="44" y="68" width="12" height="6" rx="2.5" fill={isDark ? '#151518' : '#fcf9f2'} stroke="#2d2a26" strokeWidth="2" />

          {/* Body */}
          <rect 
            x="25" 
            y="74" 
            width="50" 
            height="30" 
            rx="10" 
            fill={isDark ? '#2d2d30' : '#fffdfa'} 
            stroke="#2d2a26" 
            strokeWidth="3.5" 
          />
          
          {/* Chest UI Panel */}
          <rect 
            x="33" 
            y="80" 
            width="34" 
            height="15" 
            rx="4" 
            fill={isDark ? '#0c0c0e' : '#bae6fd'} 
            stroke="#2d2a26"
            strokeWidth="2"
          />
          
          {/* Glowing heart/battery status */}
          <motion.circle 
            cx="41" 
            cy="87.5" 
            r="3.5" 
            fill={isActivePartner ? '#f43f5e' : isDark ? '#10b981' : '#2d2a26'} 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <line x1="50" y1="87.5" x2="61" y2="87.5" stroke="#2d2a26" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="87.5" x2="57" y2="87.5" stroke={isActivePartner ? '#f43f5e' : isDark ? '#38bdf8' : '#e11d48'} strokeWidth="3" strokeLinecap="round" />

          {/* Hovering Engine Flame / Thruster */}
          <motion.path 
            d="M 43,104 L 57,104 L 50,115 Z" 
            fill="#f59e0b" 
            stroke="#2d2a26"
            strokeWidth="1.5"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path 
            d="M 46,104 L 54,104 L 50,111 Z" 
            fill="#ef4444" 
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
