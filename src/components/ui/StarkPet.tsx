'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { playTextBlip } from '@/lib/audio';

export function StarkPet() {
  const { 
    frierenConfig, 
    frierenSpeech,
    setFrierenSpeech,
    starkSpeech, 
    setStarkSpeech, 
    isChatInputOpen, 
    setIsChatInputOpen,
    activeChatPartner,
    setActiveChatPartner,
    isThinking
  } = useOSStore();
  const { isSpawned, spawnStark, scale, speechVolume } = frierenConfig;

  const isInConversation = activeChatPartner === 'stark' && (isChatInputOpen || !!frierenSpeech || !!starkSpeech || isThinking);

  // Stark NPC states
  const [position, setPosition] = useState({ x: 200, y: 400 });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  const [transparentImg, setTransparentImg] = useState<string | null>(null);
  const [transparentTalkingImg, setTransparentTalkingImg] = useState<string | null>(null);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState('');
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // References
  const animationFrameRef = useRef<number | null>(null);
  const directionRef = useRef(direction);
  const isWalkingRef = useRef(isWalking);

  // Keep references synced to avoid stale closures in tick loops
  useEffect(() => {
    directionRef.current = direction;
    isWalkingRef.current = isWalking;
  }, [direction, isWalking]);

  // 1. Dynamic Chroma-Keying & Centering for Stark
  useEffect(() => {
    if (!isSpawned || !spawnStark) return;

    const img = new Image();
    img.src = '/sprites/stark.png';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cellWidth = 240;
      const cellHeight = 280;
      const halfWidth = 120;

      const newSheetCanvas = document.createElement('canvas');
      newSheetCanvas.width = cellWidth * 4;
      newSheetCanvas.height = cellHeight * 4;
      const newCtx = newSheetCanvas.getContext('2d');
      if (!newCtx) return;

      // Centroids and safe starting Y values for Stark
      const centerX = [
        [244, 504, 762, 1014], // Row 0 (Down)
        [244, 506, 767, 1018], // Row 1 (Right)
        [241, 500, 756, 1005], // Row 2 (Left)
        [239, 499, 760, 1012]  // Row 3 (Up)
      ];
      const startY = [65, 350, 630, 890];

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      tempCtx.drawImage(img, 0, 0);

      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const pixels = imgData.data;

      // Extract key color from top-left pixel
      const keyR = pixels[0];
      const keyG = pixels[1];
      const keyB = pixels[2];

      // Replace matching background color with transparent
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Tolerance of 15 to handle slight compression artifacts
        if (Math.abs(r - keyR) < 15 && Math.abs(g - keyG) < 15 && Math.abs(b - keyB) < 15) {
          pixels[i + 3] = 0;
        }
      }
      tempCtx.putImageData(imgData, 0, 0);

      // Slice and draw each centered Stark sprite
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const sX = centerX[r][c] - halfWidth;
          const sY = startY[r];
          const dX = c * cellWidth;
          const dY = r * cellHeight;

          newCtx.drawImage(
            tempCanvas,
            sX, sY, cellWidth, cellHeight,
            dX, dY, cellWidth, cellHeight
          );
        }
      }

      setTransparentImg(newSheetCanvas.toDataURL());

      // Create a secondary canvas for talking mouth animation
      const talkingCanvas = document.createElement('canvas');
      talkingCanvas.width = cellWidth * 4;
      talkingCanvas.height = cellHeight * 4;
      const talkingCtx = talkingCanvas.getContext('2d');
      if (talkingCtx) {
        talkingCtx.drawImage(newSheetCanvas, 0, 0);
        talkingCtx.fillStyle = 'rgb(85, 35, 35)'; // Dark mouth cavity

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const dX = c * cellWidth;
            const dY = r * cellHeight;

            if (r === 0) { // Down
              const mouthX = 120;
              const mouthY = 124;
              talkingCtx.fillRect(dX + mouthX - 3, dY + mouthY, 6, 4);
            } else if (r === 1) { // Right (Row 1 is Right-facing for Stark)
              const mouthX = 124;
              const mouthY = 123;
              talkingCtx.fillRect(dX + mouthX - 2, dY + mouthY, 3, 4);
            } else if (r === 2) { // Left (Row 2 is Left-facing for Stark)
              const mouthX = 116;
              const mouthY = 123;
              talkingCtx.fillRect(dX + mouthX - 1, dY + mouthY, 3, 4);
            }
          }
        }
        setTransparentTalkingImg(talkingCanvas.toDataURL());
      }
    };
  }, [isSpawned, spawnStark]);

  // Initial spawn point
  useEffect(() => {
    if (isSpawned && spawnStark && typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth * 0.3 - scale / 2,
        y: window.innerHeight * 0.6 - scale / 2 - 48,
      });
    }
  }, [isSpawned, spawnStark, scale]);

  // 2. Sprite walking frame loops (runs at ~7.5Hz when walking)
  useEffect(() => {
    if (!isSpawned || !spawnStark || !isWalking) {
      setFrame(0);
      return;
    }

    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 140);

    return () => clearInterval(timer);
  }, [isSpawned, spawnStark, isWalking]);

  // 3. Autonomous NPC Wandering AI Loop
  useEffect(() => {
    if (!isSpawned || !spawnStark) return;

    if (isInConversation) {
      setIsWalking(false);
      return;
    }

    const runAIDecision = () => {
      if (isInConversation) {
        setIsWalking(false);
        return;
      }
      const rand = Math.random();
      if (rand < 0.3) {
        // 30% chance to stop and stand idle
        setIsWalking(false);
      } else {
        // 70% chance to walk in a random direction
        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        setDirection(randomDir);
        setIsWalking(true);
      }

      // Schedule next action in 2 to 5 seconds
      const nextDelay = 2000 + Math.random() * 3000;
      aiTimerRef.current = setTimeout(runAIDecision, nextDelay);
    };

    const aiTimerRef = { current: setTimeout(runAIDecision, 1200) };

    return () => {
      clearTimeout(aiTimerRef.current);
    };
  }, [isSpawned, spawnStark, isInConversation]);

  // Face Frieren during conversation
  useEffect(() => {
    if (!isSpawned || !spawnStark || !isInConversation) return;

    const faceFrieren = () => {
      const frierenEl = document.getElementById('frieren-pet');
      const starkEl = document.getElementById('stark-pet');
      if (frierenEl && starkEl) {
        const r1 = frierenEl.getBoundingClientRect();
        const r2 = starkEl.getBoundingClientRect();
        const c1x = r1.left + r1.width / 2;
        const c1y = r1.top + r1.height / 2;
        const c2x = r2.left + r2.width / 2;
        const c2y = r2.top + r2.height / 2;
        const dx = c1x - c2x;
        const dy = c1y - c2y;

        if (Math.abs(dx) > Math.abs(dy)) {
          setDirection(dx > 0 ? 'right' : 'left');
        } else {
          setDirection(dy > 0 ? 'down' : 'up');
        }
      }
    };

    faceFrieren();
    const interval = setInterval(faceFrieren, 100);
    return () => clearInterval(interval);
  }, [isSpawned, spawnStark, isInConversation]);

  // 4. Movement Tick Loop (updates position at 60fps, handles screen boundary rebounds)
  useEffect(() => {
    if (!isSpawned || !spawnStark) return;

    const starkSpeed = 1.8; // Stark moves slightly faster than Fern

    const tick = () => {
      if (isWalkingRef.current) {
        const dir = directionRef.current;
        let dx = 0;
        let dy = 0;

        if (dir === 'up') dy = -1;
        if (dir === 'down') dy = 1;
        if (dir === 'left') dx = -1;
        if (dir === 'right') dx = 1;

        setPosition((pos) => {
          const maxX = window.innerWidth - scale;
          const maxY = window.innerHeight - scale - 48; // Exclude taskbar

          let nextX = pos.x + dx * starkSpeed;
          let nextY = pos.y + dy * starkSpeed;
          let reboundOccurred = false;
          let nextDir = dir;

          // Rebound on horizontal edges
          if (nextX < 0) {
            nextX = 0;
            nextDir = 'right';
            reboundOccurred = true;
          } else if (nextX > maxX) {
            nextX = maxX;
            nextDir = 'left';
            reboundOccurred = true;
          }

          // Rebound on vertical edges
          if (nextY < 0) {
            nextY = 0;
            nextDir = 'down';
            reboundOccurred = true;
          } else if (nextY > maxY) {
            nextY = maxY;
            nextDir = 'up';
            reboundOccurred = true;
          }

          if (reboundOccurred) {
            setDirection(nextDir);
          }

          return { x: nextX, y: nextY };
        });
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpawned, spawnStark, scale]);

  // 5. Silent Typewriter Speech Bubble & Mouth Animation
  useEffect(() => {
    if (!starkSpeech) {
      setDisplayedSpeech('');
      setIsMouthOpen(false);
      return;
    }

    let animFrameId: number;

    // Clear any pending timeout to close the bubble
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = null;
    }

    const charDuration = 45; // 45ms per character
    const duration = starkSpeech.length * charDuration;
    const startTime = performance.now();
    let lastCharsCount = 0;

    const updateFallback = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const charsToShow = Math.floor(progress * starkSpeech.length);

      if (charsToShow > lastCharsCount) {
        if (charsToShow % 2 === 0) {
          playTextBlip('stark', speechVolume);
        }
        lastCharsCount = charsToShow;
      }

      setDisplayedSpeech(starkSpeech.slice(0, charsToShow));

      // Toggle mouth open/closed every 150ms while typing
      const isMouthOpenNow = Math.floor(elapsed / 150) % 2 === 0 && progress < 1;
      setIsMouthOpen(isMouthOpenNow);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(updateFallback);
      } else {
        setIsMouthOpen(false);
        // Leave the speech bubble visible for 4.5 seconds after typing completes
        bubbleTimeoutRef.current = setTimeout(() => {
          setStarkSpeech(null);
        }, 4500);
      }
    };

    animFrameId = requestAnimationFrame(updateFallback);

    return () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, [starkSpeech, setStarkSpeech]);

  // 7. Proximity Detection Loop (10Hz)
  useEffect(() => {
    if (!isSpawned || !spawnStark) return;

    const checkProximity = () => {
      const frierenEl = document.getElementById('frieren-pet');
      const starkEl = document.getElementById('stark-pet');
      if (frierenEl && starkEl) {
        const r1 = frierenEl.getBoundingClientRect();
        const r2 = starkEl.getBoundingClientRect();
        const c1x = r1.left + r1.width / 2;
        const c1y = r1.top + r1.height / 2;
        const c2x = r2.left + r2.width / 2;
        const c2y = r2.top + r2.height / 2;
        const dx = c1x - c2x;
        const dy = c1y - c2y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < 130;
        setIsNear(near);

        // Auto-leave if Frieren walks too far away
        if (!near && dist > 180 && isChatInputOpen && activeChatPartner === 'stark') {
          setIsChatInputOpen(false);
          setActiveChatPartner(null);
          setFrierenSpeech(null);
          setStarkSpeech(null);
        }
      } else {
        setIsNear(false);
      }
    };

    const interval = setInterval(checkProximity, 100);
    return () => clearInterval(interval);
  }, [isSpawned, spawnStark, isChatInputOpen, activeChatPartner, setIsChatInputOpen, setActiveChatPartner, setFrierenSpeech, setStarkSpeech]);

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
        setActiveChatPartner('stark');
        setIsChatInputOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNear, isChatInputOpen, setIsChatInputOpen, setActiveChatPartner]);

  if (!isSpawned || !spawnStark) return null;

  // Map directions to row indexes of the spritesheet
  const getDirectionRow = () => {
    switch (direction) {
      case 'down':
        return 0;
      case 'right': // Row 1 is Right
        return 1;
      case 'left':  // Row 2 is Left
        return 2;
      case 'up':
        return 3;
    }
  };

  const row = getDirectionRow();
  
  // Choose normal or talking image based on speech status and mouth open loop state
  const currentImg = (starkSpeech && isMouthOpen && transparentTalkingImg)
    ? transparentTalkingImg
    : (transparentImg || '/sprites/stark.png');
  const bgImg = `url(${currentImg})`;

  const containerWidth = (scale * 6) / 7;

  return (
    <div
      id="stark-pet"
      style={{
        position: 'absolute',
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: containerWidth,
        height: scale,
        zIndex: 5,
        pointerEvents: 'none',
      }}
      className="relative flex items-center justify-center"
    >
      {/* Interaction prompt button */}
      <AnimatePresence>
        {isNear && !isChatInputOpen && !starkSpeech && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveChatPartner('stark');
              setIsChatInputOpen(true);
            }}
            className="absolute bottom-full mb-3 px-2.5 py-1.5 bg-zinc-950/85 border border-white/10 hover:border-red-500/50 hover:bg-red-950/20 text-red-200 backdrop-blur-md rounded-lg shadow-xl text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 cursor-pointer pointer-events-auto"
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
        {(starkSpeech || (isThinking && activeChatPartner === 'stark')) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-4 py-2.5 bg-white text-zinc-900 border border-zinc-200/90 rounded-2xl shadow-xl text-xs w-max max-w-[380px] min-w-[80px] break-words font-semibold leading-relaxed text-center"
            style={{ 
              imageRendering: 'auto',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isThinking && activeChatPartner === 'stark' ? (
              <div className="flex items-center justify-center gap-1.5 py-1 px-2">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
              </div>
            ) : (
              displayedSpeech
            )}
            {/* White speech bubble pointer tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
            {/* Outline speech bubble pointer tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-zinc-200 -z-10 mt-[0.5px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stark Sprite Div */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: bgImg,
          backgroundSize: '400% 400%',
          backgroundPositionX: `-${frame * containerWidth}px`,
          backgroundPositionY: `-${row * scale}px`,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
