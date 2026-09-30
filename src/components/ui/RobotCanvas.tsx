'use client';

import React, { useEffect, useRef } from 'react';
import { PET_FLOOR_HEIGHT } from '@/lib/petSprite';
import {
  createRobotState,
  drawRobot,
  stepRobot,
  DARK_PALETTE,
  LIGHT_PALETTE,
  type RobotInput,
} from '@/lib/robotRenderer';

// Robot units per pixel are derived from the pet size: the robot is ~106 units tall
const UNITS_PER_SCALE = 125;
// Room below the feet for the thruster flames
const FLAME_ROOM = 0.22;
const CURSOR_IDLE_MS = 4000;
const MAX_SPEED = 600;

interface RobotCanvasProps {
  scale: number;
  isDark: boolean;
  isActivePartner: boolean;
  isThinking: boolean;
  /** Character currently being typed, or null when the robot is silent */
  speechCharRef: React.RefObject<string | null>;
}

/**
 * Draws the robot on a canvas that rides inside the pet container. Movement itself is done by
 * the container; this reads the container's on-screen motion to drive the walk cycle, the
 * thrusters, the lean and the facing direction.
 */
export function RobotCanvas({ scale, isDark, isActivePartner, isThinking, speechCharRef }: RobotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flagsRef = useRef({ isDark, isActivePartner, isThinking });

  useEffect(() => {
    flagsRef.current = { isDark, isActivePartner, isThinking };
  }, [isDark, isActivePartner, isThinking]);

  const cssWidth = scale * 1.6;
  const cssHeight = scale * 1.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    const u = scale / UNITS_PER_SCALE;
    const state = createRobotState();
    const pointer = { x: 0, y: 0, at: -Infinity };
    let prev = host.getBoundingClientRect();
    let vx = 0;
    let vy = 0;
    let last = performance.now();
    let raf = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.at = performance.now();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (dt <= 0) return;

      const rect = host.getBoundingClientRect();
      const ivx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, (rect.left - prev.left) / dt));
      const ivy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, (rect.top - prev.top) / dt));
      vx += (ivx - vx) * Math.min(1, dt * 12);
      vy += (ivy - vy) * Math.min(1, dt * 12);
      prev = rect;

      const floorY = window.innerHeight - PET_FLOOR_HEIGHT;
      const cursorActive = now - pointer.at < CURSOR_IDLE_MS;
      const headX = rect.left + rect.width / 2;
      const headY = rect.bottom - 70 * u;
      const flags = flagsRef.current;

      const input: RobotInput = {
        vx,
        vy,
        grounded: rect.bottom >= floorY - 4,
        look: cursorActive ? { x: pointer.x - headX, y: pointer.y - headY } : null,
        talkChar: speechCharRef.current,
        thinking: flags.isThinking && flags.isActivePartner,
        active: flags.isActivePartner,
        u,
      };

      stepRobot(state, input, dt);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.translate(cssWidth / 2, cssHeight - scale * FLAME_ROOM);
      ctx.scale(u, u);
      drawRobot(ctx, state, input, flags.isDark ? DARK_PALETTE : LIGHT_PALETTE);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [scale, cssWidth, cssHeight, speechCharRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute pointer-events-none select-none"
      style={{
        left: '50%',
        bottom: -scale * FLAME_ROOM,
        width: cssWidth,
        height: cssHeight,
        transform: 'translateX(-50%)',
      }}
    />
  );
}
