'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/** Which way the bubble box extends from the pet: centred on it, or off to one side. */
export type BubbleSide = 'center' | 'left' | 'right';

/** How far past the pet's centre the bubble's near edge sits, so the tail still points at the pet */
const EDGE_OVERHANG = 28;

/**
 * While two pets are talking, each bubble extends away from the other pet so the two
 * bubbles never stack on top of each other. Returns 'center' when there is no partner.
 */
export function useBubbleSide(selfId: string, partnerId: string | null, enabled: boolean): BubbleSide {
  const [side, setSide] = useState<BubbleSide>('center');

  useEffect(() => {
    if (!enabled || !partnerId) return;

    const update = () => {
      const self = document.getElementById(selfId);
      const partner = document.getElementById(partnerId);
      if (!self || !partner) return;
      const a = self.getBoundingClientRect();
      const b = partner.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      // Partner on the right: extend left, and the other way round
      setSide(Math.abs(dx) < 20 ? 'center' : dx > 0 ? 'left' : 'right');
    };

    const first = setTimeout(update, 0);
    const interval = setInterval(update, 250);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [selfId, partnerId, enabled]);

  return enabled && partnerId ? side : 'center';
}

interface SpeechBubbleProps {
  children: React.ReactNode;
  side?: BubbleSide;
}

/** Doodle speech bubble that sits above a pet. Render inside an AnimatePresence. */
export function SpeechBubble({ children, side = 'center' }: SpeechBubbleProps) {
  const box: React.CSSProperties =
    side === 'left'
      ? { right: `calc(50% - ${EDGE_OVERHANG}px)` }
      : side === 'right'
        ? { left: `calc(50% - ${EDGE_OVERHANG}px)` }
        : { left: '50%', translate: '-50% 0' };
  const tail: React.CSSProperties =
    side === 'left'
      ? { right: EDGE_OVERHANG, translate: '50% 0' }
      : side === 'right'
        ? { left: EDGE_OVERHANG, translate: '-50% 0' }
        : { left: '50%', translate: '-50% 0' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ type: 'spring', damping: 15, stiffness: 220 }}
      role="status"
      className="absolute bottom-full mb-3 px-4 py-2.5 bg-surface-2 text-fg border-[2.5px] border-line shadow-doodle-md rounded-2xl text-xs w-max max-w-[min(380px,calc(100vw-2rem))] min-w-[90px] break-words font-doodle font-bold leading-relaxed text-center z-50"
      style={{ imageRendering: 'auto', ...box }}
    >
      {children}
      {/* Doodle speech bubble pointer tail */}
      <div className="absolute top-full border-[7px] border-transparent border-t-line" style={tail} />
      <div className="absolute top-full border-[5px] border-transparent border-t-surface-2 -mt-[1px]" style={tail} />
    </motion.div>
  );
}
