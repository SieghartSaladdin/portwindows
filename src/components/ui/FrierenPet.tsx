'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { playTextBlip } from '@/lib/audio';

export function FrierenPet() {
  const { 
    frierenConfig, 
    updateFrierenConfig, 
    frierenSpeech, 
    setFrierenSpeech 
  } = useOSStore();
  const { isSpawned, scale, speed, speechVolume } = frierenConfig;

  // Sprite animation states
  const [position, setPosition] = useState({ x: 300, y: 200 });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  const [transparentImg, setTransparentImg] = useState<string | null>(null);
  const [transparentTalkingImg, setTransparentTalkingImg] = useState<string | null>(null);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState('');
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // References for keyboard state tracking
  const pressedKeys = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const directionRef = useRef(direction);
  const speedRef = useRef(speed);
  const scaleRef = useRef(scale);

  // Sync refs to avoid stale closures in tick loops
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // 1. Dynamic Chroma-Keying & Centering to align grid sheets
  useEffect(() => {
    if (!isSpawned) return;

    const img = new Image();
    img.src = '/sprites/frieren.png';
    img.crossOrigin = 'anonymous'; // Prevent CORS issues if hosted elsewhere
    img.onload = () => {
      // Create a perfectly aligned 4x4 sheet where each cell is exactly 240x280px
      const cellWidth = 240;
      const cellHeight = 280;
      const halfWidth = 120;
      const halfHeight = 140;
      
      const newSheetCanvas = document.createElement('canvas');
      newSheetCanvas.width = cellWidth * 4;
      newSheetCanvas.height = cellHeight * 4;
      const newCtx = newSheetCanvas.getContext('2d');
      if (!newCtx) return;

      // 2D Centroids of each sprite cell based on pixel analysis of the new 1254x1254 sheet
      const centerX = [
        [266, 482, 765, 1003], // Row 0
        [266, 496, 764, 996],  // Row 1
        [272, 490, 768, 1002], // Row 2
        [263, 481, 760, 997]   // Row 3
      ];
      // Disjoint Y starting offsets to completely prevent row-to-row bleed
      const startY = [50, 340, 620, 896];

      // Draw original image on temp canvas to key out background color
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

      // Remove matching background color
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

      // Slice and draw each centered sprite to the aligned spritesheet
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const sX = centerX[r][c] - halfWidth;
          const sY = startY[r];
          const dX = c * cellWidth;
          const dY = r * cellHeight;
          
          newCtx.drawImage(
            tempCanvas,
            sX, sY, cellWidth, cellHeight, // Crop source
            dX, dY, cellWidth, cellHeight  // Draw destination
          );
        }
      }

      setTransparentImg(newSheetCanvas.toDataURL());

      // Create a secondary canvas for talking animation
      const talkingCanvas = document.createElement('canvas');
      talkingCanvas.width = cellWidth * 4;
      talkingCanvas.height = cellHeight * 4;
      const talkingCtx = talkingCanvas.getContext('2d');
      if (talkingCtx) {
        // Draw the normal spritesheet onto it first
        talkingCtx.drawImage(newSheetCanvas, 0, 0);
        
        // Draw open mouths on the talking spritesheet in rows 0, 1, 2
        talkingCtx.fillStyle = 'rgb(85, 35, 35)'; // Dark reddish brown mouth cavity
        
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const dX = c * cellWidth;
            const dY = r * cellHeight;
            
            if (r === 0) { // Down
              const mouthX = 120;
              const mouthY = 106; // Precise Y center relative to startY[0]
              talkingCtx.fillRect(dX + mouthX - 3, dY + mouthY, 6, 4);
            } else if (r === 1) { // Right
              const mouthX = 122;
              const mouthY = 96;  // Precise Y center relative to startY[1]
              talkingCtx.fillRect(dX + mouthX - 2, dY + mouthY, 3, 4);
            } else if (r === 2) { // Left
              const mouthX = 118;
              const mouthY = 118; // Precise Y center relative to startY[2]
              talkingCtx.fillRect(dX + mouthX - 1, dY + mouthY, 3, 4);
            }
          }
        }
        setTransparentTalkingImg(talkingCanvas.toDataURL());
      }
    };
  }, [isSpawned]);

  // Center Frieren on initial spawn
  useEffect(() => {
    if (isSpawned && typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth / 2 - scale / 2,
        y: window.innerHeight / 2 - scale / 2 - 48,
      });
    }
  }, [isSpawned, scale]);

  // 2. Sprite walking frame loops (runs at ~8Hz when walking)
  useEffect(() => {
    if (!isSpawned || !isWalking) {
      setFrame(0);
      return;
    }

    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 130);

    return () => clearInterval(timer);
  }, [isSpawned, isWalking]);

  // 3. Movement and Keyboard loops
  useEffect(() => {
    if (!isSpawned) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if typing in form inputs, textareas or terminal
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        pressedKeys.current.add(key);
        setIsWalking(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.current.delete(key);
      
      if (pressedKeys.current.size === 0) {
        setIsWalking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Movement Tick Loop via requestAnimationFrame
    const tick = (timestamp: number) => {
      if (pressedKeys.current.size > 0) {
        let dx = 0;
        let dy = 0;
        let newDir = directionRef.current;

        // Calculate movements based on keys pressed
        if (pressedKeys.current.has('w') || pressedKeys.current.has('arrowup')) {
          dy = -1;
          newDir = 'up';
        }
        if (pressedKeys.current.has('s') || pressedKeys.current.has('arrowdown')) {
          dy = 1;
          newDir = 'down';
        }
        if (pressedKeys.current.has('a') || pressedKeys.current.has('arrowleft')) {
          dx = -1;
          newDir = 'left';
        }
        if (pressedKeys.current.has('d') || pressedKeys.current.has('arrowright')) {
          dx = 1;
          newDir = 'right';
        }

        // Set direction state
        if (newDir !== directionRef.current) {
          setDirection(newDir);
        }

        // Apply movement vector
        if (dx !== 0 || dy !== 0) {
          // Normalize diagonal speed
          const length = Math.sqrt(dx * dx + dy * dy);
          const moveX = (dx / length) * speedRef.current;
          const moveY = (dy / length) * speedRef.current;

          setPosition((pos) => {
            const currentScale = scaleRef.current;
            const maxX = window.innerWidth - currentScale;
            const maxY = window.innerHeight - currentScale - 48; // Excluding taskbar (48px)

            return {
              x: Math.max(0, Math.min(maxX, pos.x + moveX)),
              y: Math.max(0, Math.min(maxY, pos.y + moveY)),
            };
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpawned]);

  // 5. Silent Typewriter Speech Bubble & Mouth Animation
  useEffect(() => {
    if (!frierenSpeech) {
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
    const duration = frierenSpeech.length * charDuration;
    const startTime = performance.now();
    let lastCharsCount = 0;

    const updateFallback = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const charsToShow = Math.floor(progress * frierenSpeech.length);
      
      if (charsToShow > lastCharsCount) {
        if (charsToShow % 2 === 0) {
          playTextBlip('frieren', speechVolume);
        }
        lastCharsCount = charsToShow;
      }

      setDisplayedSpeech(frierenSpeech.slice(0, charsToShow));

      // Toggle mouth open/closed every 150ms while typing
      const isMouthOpenNow = Math.floor(elapsed / 150) % 2 === 0 && progress < 1;
      setIsMouthOpen(isMouthOpenNow);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(updateFallback);
      } else {
        setIsMouthOpen(false);
        // Leave the speech bubble visible for 4.5 seconds after typing completes
        bubbleTimeoutRef.current = setTimeout(() => {
          setFrierenSpeech(null);
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
  }, [frierenSpeech, setFrierenSpeech]);

  if (!isSpawned) return null;

  // Map directions to row indexes of the spritesheet
  const getDirectionRow = () => {
    switch (direction) {
      case 'down':
        return 0;
      case 'right':
        return 1;
      case 'left':
        return 2;
      case 'up':
        return 3;
    }
  };

  const row = getDirectionRow();
  
  // Choose normal or talking image based on speech status and mouth open loop state
  const currentImg = (frierenSpeech && isMouthOpen && transparentTalkingImg)
    ? transparentTalkingImg
    : (transparentImg || '/sprites/frieren.png');
  const bgImg = `url(${currentImg})`;

  const containerWidth = (scale * 6) / 7;

  return (
    <div
      id="frieren-pet"
      style={{
        position: 'absolute',
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: containerWidth,
        height: scale,
        zIndex: 5, // Sits in front of wallpaper, behind active windows
        pointerEvents: 'none', // Clicking "through" Frieren makes desktop shortcuts accessible
      }}
      className="relative flex items-center justify-center"
    >
      {/* Speech Bubble Overlay */}
      <AnimatePresence>
        {frierenSpeech && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-4 py-2.5 bg-white text-zinc-900 border border-zinc-200/90 rounded-2xl shadow-xl text-xs w-max max-w-[380px] min-w-[80px] break-words font-semibold leading-relaxed text-center"
            style={{ 
              imageRendering: 'auto', // Reset pixelation for text legibility
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
            }}
          >
            {displayedSpeech}
            {/* White speech bubble pointer tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white" />
            {/* Outline speech bubble pointer tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-zinc-200 -z-10 mt-[0.5px]" />
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Frieren Sprite Div */}
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
