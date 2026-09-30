'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { playTextBlip } from '@/lib/audio';
import { SpeechBubble, useBubbleSide } from '@/components/ui/SpeechBubble';
import {
  buildGroundedPetSheet,
  PET_CELL_HEIGHT,
  PET_CELL_WIDTH,
  PET_FLOOR_HEIGHT,
} from '@/lib/petSprite';

type Facing = 'up' | 'down' | 'left' | 'right';

const KEY_DIRECTIONS: Record<string, Facing> = {
  w: 'up',
  arrowup: 'up',
  s: 'down',
  arrowdown: 'down',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
};

export function FrierenPet() {
  const { 
    frierenConfig, 
    frierenSpeech,
    setFrierenSpeech,
    fernSpeech,
    starkSpeech,
    robotSpeech,
    activeChatPartner,
    chatMode,
    isChatInputOpen,
    isThinking
  } = useOSStore();
  const { isSpawned, scale, speed } = frierenConfig;

  // A conversation is only live while the chat bar is open or someone is still talking/thinking.
  // activeChatPartner alone lingers after the bar closes, so it must not drive her behaviour.
  const partnerSpeech =
    activeChatPartner === 'fern' ? fernSpeech : activeChatPartner === 'stark' ? starkSpeech : robotSpeech;
  const isInConversation =
    !!activeChatPartner && (isChatInputOpen || !!partnerSpeech || !!frierenSpeech || isThinking);
  const partnerPetId =
    activeChatPartner === 'fern' ? 'fern-pet' : activeChatPartner === 'stark' ? 'stark-pet' : 'robot-pet';
  // Only the floor-bound partners can be walked up to; the robot comes to her instead
  const approachTargetId =
    isInConversation && chatMode === 'frieren' && (activeChatPartner === 'fern' || activeChatPartner === 'stark')
      ? partnerPetId
      : null;
  const bubbleSide = useBubbleSide(
    'frieren-pet',
    partnerPetId,
    isInConversation && chatMode === 'frieren' && !!activeChatPartner,
  );

  // Sprite animation states
  const [position, setPosition] = useState({ x: 300, y: 200 });
  const [direction, setDirection] = useState<Facing>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  const [transparentImg, setTransparentImg] = useState<string | null>(null);
  const [transparentTalkingImg, setTransparentTalkingImg] = useState<string | null>(null);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState('');
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // References for keyboard state tracking
  const pressedKeys = useRef<Set<string>>(new Set());
  // Held movement keys in press order; the most recent one decides which way Frieren faces
  const keyOrder = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const approachingRef = useRef(false);

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

  // 1. Dynamic Chroma-Keying & Foot-Baseline Grounding to align grid sheets
  useEffect(() => {
    if (!isSpawned) return;

    const img = new Image();
    img.src = '/sprites/frieren.png';
    img.crossOrigin = 'anonymous'; // Prevent CORS issues if hosted elsewhere
    img.onload = () => {
      // 2D Centroids of each sprite cell based on pixel analysis of the 1254x1254 sheet
      const centerX = [
        [266, 482, 765, 1003], // Row 0
        [266, 496, 764, 996],  // Row 1
        [272, 490, 768, 1002], // Row 2
        [263, 481, 760, 997]   // Row 3
      ];

      const sheet = buildGroundedPetSheet(img, {
        centerX,
        legacyStartY: [50, 340, 620, 896],
      });
      if (!sheet) return;

      setTransparentImg(sheet.dataUrl);

      // Create a secondary canvas for talking animation
      const talkingCanvas = document.createElement('canvas');
      talkingCanvas.width = PET_CELL_WIDTH * 4;
      talkingCanvas.height = PET_CELL_HEIGHT * 4;
      const talkingCtx = talkingCanvas.getContext('2d');
      if (talkingCtx) {
        // Draw the normal spritesheet onto it first
        talkingCtx.drawImage(sheet.canvas, 0, 0);

        // Draw open mouths on the talking spritesheet in rows 0, 1, 2
        talkingCtx.fillStyle = 'rgb(85, 35, 35)'; // Dark reddish brown mouth cavity

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const dX = c * PET_CELL_WIDTH;
            // Follow the frame down by however much grounding moved it
            const dY = r * PET_CELL_HEIGHT + sheet.cellShift[r][c];

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- existing pet animation logic, intentionally unchanged
      setPosition({
        x: window.innerWidth / 2 - scale / 2,
        y: window.innerHeight - scale - PET_FLOOR_HEIGHT,
      });
    }
  }, [isSpawned, scale]);

  // Maintain vertical position relative to taskbar on window resize
  useEffect(() => {
    if (!isSpawned || typeof window === 'undefined') return;

    const handleResize = () => {
      setPosition((pos) => {
        const maxX = window.innerWidth - scale;
        return {
          x: Math.max(0, Math.min(maxX, pos.x)),
          y: window.innerHeight - scale - PET_FLOOR_HEIGHT,
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSpawned, scale]);

  // 2. Sprite walking frame loops (runs at ~8Hz when walking)
  useEffect(() => {
    if (!isSpawned || !isWalking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- existing pet animation logic, intentionally unchanged
      setFrame(0);
      return;
    }

    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 130);

    return () => clearInterval(timer);
  }, [isSpawned, isWalking]);

  // Turn Frieren to face down when idle for a short period (not while she is talking to someone)
  useEffect(() => {
    if (!isSpawned || isWalking || isInConversation) return;

    const timer = setTimeout(() => {
      setDirection('down');
    }, 1500); // 1.5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [isSpawned, isWalking, isInConversation]);

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
      if (key in KEY_DIRECTIONS) {
        if (key.startsWith('arrow')) e.preventDefault();
        if (!pressedKeys.current.has(key)) {
          pressedKeys.current.add(key);
          keyOrder.current = [...keyOrder.current.filter((k) => k !== key), key];
        }
        setIsWalking(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.current.delete(key);
      keyOrder.current = keyOrder.current.filter((k) => k !== key);
      if (pressedKeys.current.size === 0) setIsWalking(false);
    };

    // Keyup never arrives if focus leaves the page mid-walk; drop every held key so she stops
    const releaseAll = () => {
      pressedKeys.current.clear();
      keyOrder.current = [];
      setIsWalking(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseAll);

    // Movement Tick Loop via requestAnimationFrame
    const tick = () => {
      if (pressedKeys.current.size > 0) {
        // Frieren walks along the taskbar: A/D move her, W/S only turn her (up = back, down = front)
        let dx = 0;
        for (const key of pressedKeys.current) {
          const dir = KEY_DIRECTIONS[key];
          if (dir === 'left') dx -= 1;
          if (dir === 'right') dx += 1;
        }

        // Always face the most recently pressed key, so W/S turn her even while walking sideways
        const lastKey = keyOrder.current[keyOrder.current.length - 1];
        const newDir = lastKey ? KEY_DIRECTIONS[lastKey] : directionRef.current;
        if (newDir !== directionRef.current) {
          directionRef.current = newDir;
          setDirection(newDir);
        }

        if (dx !== 0) {
          const moveX = dx * speedRef.current;

          setPosition((pos) => {
            const currentScale = scaleRef.current;
            const maxX = window.innerWidth - currentScale;
            // Cell bottom is the foot baseline, so this lands the boots on the taskbar line
            const targetY = window.innerHeight - currentScale - PET_FLOOR_HEIGHT;

            return {
              x: Math.max(0, Math.min(maxX, pos.x + moveX)),
              y: targetY,
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
      window.removeEventListener('blur', releaseAll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpawned]);

  // Walk up to the partner and stop at a comfortable talking distance, so the two visibly face each other
  // instead of overlapping. Any movement key hands control back to the player.
  useEffect(() => {
    if (!isSpawned || !approachTargetId) return;

    approachingRef.current = true;
    let raf = 0;
    const startedAt = performance.now();

    const finish = (facing?: Facing) => {
      approachingRef.current = false;
      if (pressedKeys.current.size === 0) setIsWalking(false);
      if (facing) setDirection(facing);
    };

    const step = () => {
      const self = document.getElementById('frieren-pet');
      const partner = document.getElementById(approachTargetId);
      if (pressedKeys.current.size > 0 || !self || !partner || performance.now() - startedAt > 3500) {
        finish();
        return;
      }

      const a = self.getBoundingClientRect();
      const b = partner.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const gap = Math.max(90, scaleRef.current * 1.8);
      // Positive: she needs to move right (toward a partner on her right, or away from one on her left)
      const delta = (Math.abs(dx) - gap) * (dx >= 0 ? 1 : -1);
      const facingPartner: Facing = dx >= 0 ? 'right' : 'left';

      if (Math.abs(delta) < 2) {
        finish(facingPartner);
        return;
      }

      const move = Math.sign(delta) * Math.min(Math.abs(delta), speedRef.current * 0.7);
      setIsWalking(true);
      setDirection(move > 0 ? 'right' : 'left');
      setPosition((pos) => ({
        x: Math.max(0, Math.min(window.innerWidth - scaleRef.current, pos.x + move)),
        y: pos.y,
      }));
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      approachingRef.current = false;
    };
  }, [isSpawned, approachTargetId]);

  // Face the active chat partner while a conversation is live
  useEffect(() => {
    if (!isInConversation || !isSpawned) return;

    const facePartner = () => {
      // Walking (keys) or stepping up to the partner decides her direction on their own
      if (approachingRef.current || pressedKeys.current.size > 0) return;
      const frierenEl = document.getElementById('frieren-pet');
      const partnerEl = document.getElementById(partnerPetId);

      if (frierenEl && partnerEl) {
        const r1 = frierenEl.getBoundingClientRect();
        const r2 = partnerEl.getBoundingClientRect();
        const dx = r2.left + r2.width / 2 - (r1.left + r1.width / 2);
        const dy = r2.top + r2.height / 2 - (r1.top + r1.height / 2);

        if (Math.abs(dx) >= Math.abs(dy)) {
          setDirection(dx > 0 ? 'right' : 'left');
        } else {
          setDirection(dy > 0 ? 'down' : 'up');
        }
      }
    };

    facePartner();
    const interval = setInterval(facePartner, 200);
    return () => clearInterval(interval);
  }, [isInConversation, partnerPetId, isSpawned]);

  // 5. Silent Typewriter Speech Bubble & Mouth Animation
  useEffect(() => {
    if (!frierenSpeech) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- existing pet animation logic, intentionally unchanged
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
          // Read the live volume so changes in Settings apply immediately
          playTextBlip('frieren', useOSStore.getState().frierenConfig.speechVolume);
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
        zIndex: 40, // Above desktop icons (10), below windows (100+)
        pointerEvents: 'none', // Clicking "through" Frieren makes desktop shortcuts accessible
      }}
      className="relative flex items-center justify-center"
    >
      {/* Speech Bubble Overlay */}
      <AnimatePresence>
        {frierenSpeech && <SpeechBubble side={bubbleSide}>{displayedSpeech}</SpeechBubble>}
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
