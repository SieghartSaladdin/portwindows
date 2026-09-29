'use client';

/**
 * The owner's signature in the corner of the sketchbook page, drawn on a <canvas>.
 *
 * After the desktop unlocks it is "written" left to right (name, then an underline scribble,
 * then the title), and stays static with hand-drawn pencil texture without line boiling.
 * Name and title come from the profile, so editing them in the Developer Hub updates the signature.
 * Clicking it opens Bio.txt.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { isPlaceholderProfile } from '@/hooks/useProfileLinks';
import { jitter, sketch, type Pt } from '@/lib/sketch';

const NAME_SIZE = 30;
const TITLE_SIZE = 19;
const PAD_X = 14;
const NAME_BASELINE = 34;
const UNDERLINE_Y = 44;
const TITLE_BASELINE = 68;
const HEIGHT = 80;

/** Writing speed for the reveal, in CSS px per second. */
const WRITE_SPEED = 260;

export function SketchSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const revealedRef = useRef(false);

  const profile = useOSStore((s) => s.profile);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const isLocked = useOSStore((s) => s.isLocked);
  const themeMode = useOSStore((s) => s.themeMode);
  const openWindow = useOSStore((s) => s.openWindow);

  const hasOwner = dataStatus === 'ready' && !isPlaceholderProfile(profile);
  const { line1, line2 } = useMemo(
    () =>
      hasOwner
        ? { line1: `sketched by ${profile.name}`, line2: profile.title || '' }
        : { line1: 'Aura OS', line2: 'a hand-drawn portfolio' },
    [hasOwner, profile.name, profile.title],
  );

  const ready = !isLocked && dataStatus !== 'loading';

  useEffect(() => {
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !button || !ctx || !ready) return;

    let cancelled = false;
    let raf = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const start = async () => {
      // next/font exposes the family on the element; make sure the glyphs are loaded before measuring
      const family = getComputedStyle(button).fontFamily || 'cursive';
      const nameFont = `700 ${NAME_SIZE}px ${family}`;
      const titleFont = `500 ${TITLE_SIZE}px ${family}`;
      try {
        await Promise.all([document.fonts.load(nameFont, line1), document.fonts.load(titleFont, line2 || 'a')]);
      } catch {
        /* fall back to whatever font is available */
      }
      if (cancelled) return;

      const color = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#2d2a26';
      ctx.font = nameFont;
      const nameWidth = ctx.measureText(line1).width;
      ctx.font = titleFont;
      const titleWidth = line2 ? ctx.measureText(line2).width : 0;

      const width = Math.ceil(Math.max(nameWidth, titleWidth) + PAD_X * 2);
      const height = line2 ? HEIGHT : HEIGHT - 26;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Right-aligned block, like a signature in the page corner
      const nameX = width - PAD_X - nameWidth;
      const titleX = width - PAD_X - titleWidth;

      // Wavy underline under the name, drawn as a sketchy stroke
      const underline: Pt[] = [];
      const ulStart = nameX + nameWidth * 0.08;
      const ulEnd = nameX + nameWidth + 6;
      for (let i = 0; i <= 8; i++) {
        const x = ulStart + ((ulEnd - ulStart) * i) / 8;
        underline.push([x, UNDERLINE_Y + Math.sin(i * 1.3) * 2.2 + (i / 8) * -3]);
      }

      /** Total "ink length" of the reveal: name, underline, title. */
      const segments = [nameWidth, ulEnd - ulStart, titleWidth];
      const total = segments.reduce((a, b) => a + b, 0);

      const drawText = (text: string, font: string, x: number, y: number, seed: number, revealW: number) => {
        if (revealW <= 0 || !text) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 4, 0, revealW + 4, height);
        ctx.clip();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        // Pass 1: the ink, nudged and tilted a hair (static, no line boil)
        const [jx, jy] = jitter(seed, 0, 0, 0.7);
        const tilt = (jitter(seed, 1, 0, 1)[0] * Math.PI) / 360;
        ctx.translate(x + jx, y + jy);
        ctx.rotate(tilt);
        ctx.globalAlpha = 0.62;
        ctx.fillText(text, 0, 0);
        // Pass 2: a thin, offset pencil re-trace
        const [kx, ky] = jitter(seed + 9, 2, 0, 0.9);
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 0.7;
        ctx.strokeText(text, kx, ky);
        ctx.restore();
      };

      const draw = (inked: number) => {
        ctx.clearRect(0, 0, width, height);
        let left = inked;
        const take = (len: number) => {
          const used = Math.max(0, Math.min(len, left));
          left -= used;
          return used;
        };

        drawText(line1, nameFont, nameX, NAME_BASELINE, 11, take(segments[0]));

        const ulDone = take(segments[1]);
        if (ulDone > 0) {
          const count = Math.max(2, Math.round((ulDone / segments[1]) * underline.length));
          sketch(ctx, underline.slice(0, count), { seed: 21, boil: 0, color, alpha: 0.55, width: 2, amp: 0.9 });
        }

        drawText(line2, titleFont, titleX, TITLE_BASELINE, 31, take(segments[2]));

        // Pencil tip while writing
        if (inked < total) {
          const tipX = inked < segments[0] ? nameX + inked : inked < segments[0] + segments[1] ? ulStart + (inked - segments[0]) : titleX + (inked - segments[0] - segments[1]);
          const tipY = inked < segments[0] ? NAME_BASELINE - 8 : inked < segments[0] + segments[1] ? UNDERLINE_Y : TITLE_BASELINE - 6;
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      };

      // Write it once per session; theme or text changes just redraw the finished signature statically
      if (revealedRef.current || reduceMotion) {
        draw(total);
        return;
      }
      const t0 = performance.now() + 250; // small pause after the desktop appears
      const step = (now: number) => {
        if (cancelled) return;
        const inked = Math.max(0, ((now - t0) / 1000) * WRITE_SPEED);
        if (inked >= total) {
          revealedRef.current = true;
          draw(total);
          return;
        }
        draw(inked);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [ready, line1, line2, themeMode]);

  const label = hasOwner ? `About ${profile.name}` : 'About this portfolio';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openWindow('bio');
      }}
      aria-label={label}
      title={label}
      className="absolute right-4 bottom-[calc(var(--spacing-taskbar)+0.75rem)] z-[11] hidden sm:block font-hand -rotate-2 opacity-70 hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer rounded-xl"
    >
      <canvas ref={canvasRef} aria-hidden className="block" />
    </button>
  );
}
