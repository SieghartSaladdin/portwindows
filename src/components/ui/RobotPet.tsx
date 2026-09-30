'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { playTextBlip } from '@/lib/audio';
import { PET_FLOOR_HEIGHT } from '@/lib/petSprite';
import { RobotCanvas } from '@/components/ui/RobotCanvas';
import { SpeechBubble, useBubbleSide } from '@/components/ui/SpeechBubble';

const FLY_TRANSITION: Transition = {
  type: 'spring',
  damping: 18,
  stiffness: 30,
  mass: 1.2,
};

export function RobotPet() {
  const { 
    frierenConfig, 
    robotSpeech,
    setRobotSpeech, 
    isChatInputOpen, 
    setIsChatInputOpen,
    activeChatPartner,
    setActiveChatPartner,
    openChat,
    chatMode,
    isThinking,
    windows,
    themeMode
  } = useOSStore();
  const isDark = themeMode === 'dark';
  const { isSpawned, scale } = frierenConfig;

  const isActivePartner = activeChatPartner === 'robot';
  const isInConversation = isActivePartner && (isChatInputOpen || !!robotSpeech || isThinking);
  // Only Frieren's conversations stop the robot. A plain click chat lets it keep flying or walking.
  const pausesMovement = isInConversation && chatMode === 'frieren';
  const bubbleSide = useBubbleSide('robot-pet', 'frieren-pet', pausesMovement);

  // States
  const [position, setPosition] = useState({ x: 800, y: 300 });
  const [travel, setTravel] = useState<Transition>(FLY_TRANSITION);
  const [displayedSpeech, setDisplayedSpeech] = useState('');
  const [isNear, setIsNear] = useState(false);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Character being typed right now, read by the canvas to shape the mouth
  const speechCharRef = useRef<string | null>(null);
  const positionRef = useRef(position);

  const containerWidth = (scale * 6) / 7;

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Initial spawn point on the floor, left side (slightly to the right of the edge widgets)
  useEffect(() => {
    if (isSpawned && typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- existing pet animation logic, intentionally unchanged
      setPosition({
        x: 190,
        y: window.innerHeight - scale - PET_FLOOR_HEIGHT,
      });
    }
  }, [isSpawned, scale]);

  // Maintain position on resize
  useEffect(() => {
    if (!isSpawned || typeof window === 'undefined') return;

    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - containerWidth - 20),
        y: Math.min(prev.y, window.innerHeight - scale - PET_FLOOR_HEIGHT),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSpawned, scale, containerWidth]);

  // Random movement loop: either walk along the floor or fly anywhere on the desktop
  useEffect(() => {
    if (!isSpawned || typeof window === 'undefined' || pausesMovement) return;

    const moveRandomly = () => {
      const margin = 80;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const floorY = screenHeight - scale - PET_FLOOR_HEIGHT;
      const prev = positionRef.current;
      const minX = margin;
      const maxX = Math.max(minX + 100, screenWidth - containerWidth - margin);

      let newX: number;
      let newY: number;

      if (Math.random() < 0.5) {
        // Walk: stay on the floor and stroll a moderate distance either way
        const pickedX = prev.x + (Math.random() * 2 - 1) * 420;
        const step = Math.abs(pickedX - prev.x) < 120
          ? (prev.x < screenWidth / 2 ? 1 : -1) * (160 + Math.random() * 200)
          : pickedX - prev.x;
        newX = Math.min(maxX, Math.max(minX, prev.x + step));
        newY = floorY;
        const distance = Math.hypot(newX - prev.x, newY - prev.y);
        const walkSpeed = scale * 0.9;
        setTravel({
          type: 'tween',
          ease: 'easeInOut',
          duration: Math.min(9, Math.max(1.2, distance / walkSpeed)),
        });
      } else {
        // Fly freely across the entire desktop screen
        newX = margin + Math.random() * Math.max(100, screenWidth - containerWidth - margin * 2);
        newY = margin + Math.random() * Math.max(100, screenHeight - scale - margin * 2 - 60);
        setTravel(FLY_TRANSITION);
      }

      setPosition({ x: newX, y: newY });
    };

    // Move every 6-9 seconds
    const interval = setInterval(moveRandomly, 7000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isSpawned, containerWidth, scale, pausesMovement]);

  // Talking to the robot as Frieren: it lands beside her at a comfortable talking distance
  useEffect(() => {
    if (!isSpawned || !pausesMovement || typeof window === 'undefined') return;
    const frieren = document.getElementById('frieren-pet');
    if (!frieren) return;

    const f = frieren.getBoundingClientRect();
    const frierenCenter = f.left + f.width / 2;
    const prev = positionRef.current;
    const side = prev.x + containerWidth / 2 >= frierenCenter ? 1 : -1;
    const gap = Math.max(90, scale * 1.8);
    const newX = Math.min(window.innerWidth - containerWidth, Math.max(0, frierenCenter + side * gap - containerWidth / 2));
    const newY = window.innerHeight - scale - PET_FLOOR_HEIGHT;
    const distance = Math.hypot(newX - prev.x, newY - prev.y);

    setTravel({ type: 'tween', ease: 'easeOut', duration: Math.min(3, Math.max(0.5, distance / (scale * 2.2))) });
    setPosition({ x: newX, y: newY });
  }, [isSpawned, pausesMovement, containerWidth, scale]);

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
        bio: "Bio.txt loaded! Here you can read about the developer, their experience and how to get in touch.",
        projects: "Projects loaded! Pick any project to see its details and links.",
        terminal: "Terminal shell active. Type 'help' or 'neofetch' to explore!",
        settings: "Control Panel loaded. Let me know if you need help adjusting settings!",
        frieren: "Frieren.exe character panel loaded. Let's configure the companion pets!",
        admin: "Developer Hub is for the site owner. Sign in with your admin username and password.",
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
        openChat('robot', 'frieren');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNear, isChatInputOpen, openChat]);

  // Typewriter Text Effect & Mouth Animation
  useEffect(() => {
    if (!robotSpeech) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- existing pet animation logic, intentionally unchanged
      setDisplayedSpeech('');
      speechCharRef.current = null;
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
          // Read the live volume so changes in Settings apply immediately
          playTextBlip('robot', useOSStore.getState().frierenConfig.speechVolume);
        }
        lastCharsCount = charsToShow;
      }

      setDisplayedSpeech(robotSpeech.slice(0, charsToShow));

      if (progress < 1) {
        // The canvas opens the mouth wide on vowels and narrow on consonants
        speechCharRef.current = robotSpeech[Math.max(0, charsToShow - 1)] ?? ' ';
        animFrameId = requestAnimationFrame(updateFallback);
      } else {
        speechCharRef.current = null;
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
      speechCharRef.current = null;
    };
  }, [robotSpeech, setRobotSpeech]);

  if (!isSpawned) return null;


  return (
    <motion.div
      id="robot-pet"
      role="button"
      tabIndex={0}
      aria-label="Chat with HelperBot"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openChat('robot', 'user');
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        openChat('robot', 'user');
      }}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={travel}
      style={{
        position: 'absolute',
        width: containerWidth,
        height: scale,
        zIndex: 40, // Above desktop icons (10), below windows (100+)
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
              openChat('robot', 'frieren');
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
            className="absolute bottom-full mb-3 px-2.5 py-1 bg-surface text-fg border-2 border-line hover:bg-highlight hover:text-ink hover:border-ink rounded-xl shadow-doodle-sm text-2xs font-bold tracking-wide uppercase flex items-center gap-1.5 cursor-pointer pointer-events-auto whitespace-nowrap"
            aria-label="Chat with HelperBot"
            style={{ imageRendering: 'auto' }}
          >
            <span className="hidden [@media(hover:hover)]:inline px-1 rounded-md border-2 border-current text-3xs">E</span>
            <span className="hidden [@media(hover:hover)]:inline">Interact</span>
            <span className="[@media(hover:hover)]:hidden">Tap to chat</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Speech Bubble Overlay */}
      <AnimatePresence>
        {(robotSpeech || (isThinking && isActivePartner)) && (
          <SpeechBubble side={bubbleSide}>
            {isThinking && isActivePartner ? (
              <div className="flex items-center justify-center gap-1.5 py-1 px-2">
                <span className="w-2 h-2 bg-fg rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-fg rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-fg rounded-full animate-bounce" />
              </div>
            ) : (
              displayedSpeech
            )}
          </SpeechBubble>
        )}
      </AnimatePresence>

      {/* Canvas robot: walks on the floor, flies with thrusters, faces its direction */}
      <RobotCanvas
        scale={scale}
        isDark={isDark}
        isActivePartner={isActivePartner}
        isThinking={isThinking}
        speechCharRef={speechCharRef}
      />
    </motion.div>
  );
}
