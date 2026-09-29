'use client';

/**
 * Hand-drawn sky behind the desktop icons, rendered on a <canvas> (no SVG).
 *
 * Light theme: sun with slowly turning rays, drifting clouds, birds and a paper plane.
 * Dark theme: crescent moon with craters, twinkling sparkle stars and the odd shooting star.
 *
 * Every stroke "line boils": the outline is re-jittered a few times per second from a small,
 * repeating set of seeds, the way hand-drawn animation re-traces each frame. Each path is also
 * traced twice with different jitter so it reads like pencil going over a line.
 */

import { useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { BOIL_FRAMES, BOIL_INTERVAL, hash, jitter, sketch, tracePath, type Pt } from '@/lib/sketch';

interface Palette {
  stroke: string;
  strokeAlpha: number;
  sun: string;
  moon: string;
  star: string;
  cloud: string;
  cloudAlpha: number;
}

/** Render at most this often; the scene is slow-moving so 30 fps is plenty. */
const FRAME_BUDGET = 1000 / 30;

/* ------------------------------------------------------------------ */
/* Shape builders (local coordinates)                                  */
/* ------------------------------------------------------------------ */

function circlePts(cx: number, cy: number, r: number, n = 18, from = 0, to = Math.PI * 2): Pt[] {
  const pts: Pt[] = [];
  const full = Math.abs(to - from - Math.PI * 2) < 1e-6;
  const count = full ? n : n + 1;
  for (let i = 0; i < count; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/** Scalloped cloud outline: upper halves of overlapping bumps, closed by a gently curved base. */
function cloudPts(bumps: Array<[number, number, number]>): Pt[] {
  const pts: Pt[] = [];
  bumps.forEach(([x, y, r]) => {
    const steps = Math.max(5, Math.round(r / 4));
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI + (Math.PI * i) / steps;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
  });
  const first = bumps[0];
  const last = bumps[bumps.length - 1];
  const baseY = Math.max(...bumps.map((b) => b[1])) + 6;
  const left = first[0] - first[2];
  const right = last[0] + last[2];
  pts.push([right, baseY - 2]);
  for (let i = 1; i < 4; i++) pts.push([right - ((right - left) * i) / 4, baseY + (i === 2 ? 3 : 1)]);
  pts.push([left, baseY - 2]);
  return pts;
}

function sparklePts(cx: number, cy: number, R: number, r: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 4;
    const rad = i % 2 === 0 ? R : r;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  seed: number;
  bumps: Array<[number, number, number]>;
}

const CLOUD_SHAPES: Array<Array<[number, number, number]>> = [
  [[-44, 4, 18], [-16, -10, 26], [18, -4, 22], [42, 6, 14]],
  [[-30, 2, 16], [-4, -8, 22], [26, 2, 17]],
  [[-52, 6, 14], [-28, -6, 20], [2, -14, 24], [32, -2, 19], [54, 8, 12]],
];

function makeClouds(w: number, h: number, dark: boolean): Cloud[] {
  const count = w < 640 ? 2 : dark ? 2 : 4;
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: ((i + 0.35) / count) * w + hash(i + 3) * 80,
      y: 70 + hash(i + 11) * Math.min(220, h * 0.3),
      speed: 5 + hash(i + 21) * 7,
      scale: (w < 640 ? 0.75 : 1) * (0.85 + hash(i + 5) * 0.45),
      seed: 100 + i * 17,
      bumps: CLOUD_SHAPES[i % CLOUD_SHAPES.length],
    });
  }
  return clouds;
}

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
  seed: number;
  kind: 'sparkle' | 'plus' | 'dot';
}

function makeStars(w: number, h: number): Star[] {
  const count = Math.round(Math.min(34, (w * h) / 38000));
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const r = hash(i * 3.7 + 1);
    stars.push({
      x: 40 + hash(i * 1.3 + 7) * (w - 80),
      y: 30 + hash(i * 2.1 + 5) * (h * 0.62),
      size: 3 + hash(i + 40) * 6,
      phase: hash(i + 90) * Math.PI * 2,
      seed: 300 + i * 7,
      kind: r < 0.35 ? 'sparkle' : r < 0.7 ? 'plus' : 'dot',
    });
  }
  return stars;
}

function readPalette(dark: boolean): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return dark
    ? {
        stroke: v('--fg', '#f5efe2'),
        strokeAlpha: 0.55,
        sun: v('--highlight', '#fef08a'),
        moon: '#fef3c7',
        star: v('--highlight', '#fef08a'),
        cloud: v('--surface', '#262422'),
        cloudAlpha: 0.55,
      }
    : {
        stroke: v('--ink', '#2d2a26'),
        strokeAlpha: 0.5,
        sun: v('--highlight', '#fef08a'),
        moon: '#fef3c7',
        star: v('--highlight', '#fef08a'),
        cloud: v('--surface', '#fffdfa'),
        cloudAlpha: 0.92,
      };
}

export function SketchSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeMode = useOSStore((s) => s.themeMode);
  const wallpaper = useOSStore((s) => s.wallpaper);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dark = themeMode === 'dark';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let palette = readPalette(dark);
    let w = 0;
    let h = 0;
    let clouds: Cloud[] = [];
    let stars: Star[] = [];
    let raf = 0;
    let last = 0;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      clouds = makeClouds(w, h, dark);
      stars = makeStars(w, h);
    };

    const drawSun = (boil: number, t: number) => {
      const s = w < 640 ? 0.75 : 1;
      const cx = w - (w < 640 ? 70 : 170);
      const cy = w < 640 ? 70 : 105;
      const r = 30 * s;
      const spin = (t / 1000) * 0.12;
      for (let i = 0; i < 10; i++) {
        const a = spin + (Math.PI * 2 * i) / 10;
        const r1 = r + 9 * s;
        const r2 = r + (i % 2 === 0 ? 24 : 17) * s;
        sketch(ctx, [
          [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1],
          [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2],
        ], { seed: 40 + i, boil, color: palette.stroke, alpha: palette.strokeAlpha, width: 2.4 });
      }
      sketch(ctx, circlePts(cx, cy, r, 20), {
        seed: 7, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2.6,
        fill: palette.sun, fillAlpha: 0.85,
      });
      // Little doodle face
      sketch(ctx, circlePts(cx - 9 * s, cy - 4 * s, 1.6 * s, 6), { seed: 8, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2, passes: 1 });
      sketch(ctx, circlePts(cx + 9 * s, cy - 4 * s, 1.6 * s, 6), { seed: 9, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2, passes: 1 });
      sketch(ctx, circlePts(cx, cy + 3 * s, 10 * s, 8, 0.25 * Math.PI, 0.75 * Math.PI), { seed: 10, boil, color: palette.stroke, alpha: palette.strokeAlpha, width: 2, passes: 1 });
    };

    const drawMoon = (boil: number) => {
      const s = w < 640 ? 0.75 : 1;
      const cx = w - (w < 640 ? 70 : 170);
      const cy = w < 640 ? 72 : 110;
      const R = 34 * s;
      const ix = cx + 15 * s;
      const iy = cy - 9 * s;
      const iR = R * 0.86;

      sketch(ctx, circlePts(cx, cy, R, 22), {
        seed: 60, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2.4,
        fill: palette.moon, fillAlpha: 0.95,
      });
      // Carve the crescent: erase the canvas (revealing the paper) where the inner circle overlaps
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      tracePath(ctx, circlePts(ix, iy, iR, 22).map((p, i) => {
        const j = jitter(61, i, boil, 0.8);
        return [p[0] + j[0], p[1] + j[1]] as Pt;
      }), true);
      ctx.fill();
      ctx.restore();
      // Trace the inner edge, only where it lies inside the moon
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 3, 0, Math.PI * 2);
      ctx.clip();
      sketch(ctx, circlePts(ix, iy, iR, 22), { seed: 62, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2.2 });
      ctx.restore();
      // Craters on the lit part
      sketch(ctx, circlePts(cx - 17 * s, cy + 4 * s, 4 * s, 8), { seed: 63, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha * 0.8, width: 1.6, passes: 1 });
      sketch(ctx, circlePts(cx - 8 * s, cy + 19 * s, 2.6 * s, 7), { seed: 64, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha * 0.8, width: 1.6, passes: 1 });
    };

    const drawCloud = (c: Cloud, boil: number) => {
      const pts = cloudPts(c.bumps).map(([x, y]) => [c.x + x * c.scale, c.y + y * c.scale] as Pt);
      sketch(ctx, pts, {
        seed: c.seed, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2.3,
        fill: palette.cloud, fillAlpha: palette.cloudAlpha,
      });
      // A couple of inner scribble lines for texture
      const b = c.bumps[1];
      sketch(ctx, circlePts(c.x + b[0] * c.scale, c.y + b[1] * c.scale, b[2] * c.scale * 0.55, 6, 1.15 * Math.PI, 1.6 * Math.PI), {
        seed: c.seed + 3, boil, color: palette.stroke, alpha: palette.strokeAlpha * 0.55, width: 1.6, passes: 1,
      });
    };

    const drawStar = (st: Star, boil: number, t: number) => {
      const tw = reduceMotion ? 1 : 0.75 + 0.25 * Math.sin(t / 700 + st.phase);
      const size = st.size * tw;
      if (st.kind === 'sparkle') {
        sketch(ctx, sparklePts(st.x, st.y, size * 1.6, size * 0.45), {
          seed: st.seed, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 1.6,
          fill: palette.star, fillAlpha: 0.9, amp: 0.8,
        });
      } else if (st.kind === 'plus') {
        sketch(ctx, [[st.x - size, st.y], [st.x + size, st.y]], { seed: st.seed, boil, color: palette.star, alpha: 0.8 * tw, width: 1.8, amp: 0.6 });
        sketch(ctx, [[st.x, st.y - size], [st.x, st.y + size]], { seed: st.seed + 1, boil, color: palette.star, alpha: 0.8 * tw, width: 1.8, amp: 0.6 });
      } else {
        sketch(ctx, circlePts(st.x, st.y, Math.max(1.2, size * 0.28), 5), {
          seed: st.seed, boil, closed: true, color: palette.star, alpha: 0.75 * tw, width: 1.4, fill: palette.star, fillAlpha: 0.7 * tw, amp: 0.4, passes: 1,
        });
      }
    };

    /** One shooting star every ~11 s, crossing the upper sky in about a second. */
    const drawShootingStar = (boil: number, t: number) => {
      const period = 11000;
      const k = ((t + 4000) % period) / 1000; // seconds into this cycle
      if (k > 1.1) return;
      const cycle = Math.floor((t + 4000) / period);
      const sx = w * (0.25 + hash(cycle) * 0.5);
      const sy = 40 + hash(cycle + 1) * h * 0.2;
      const hx = sx + k * 260;
      const hy = sy + k * 110;
      const fade = k < 0.15 ? k / 0.15 : Math.max(0, 1 - (k - 0.7) / 0.4);
      sketch(ctx, [[hx - 70, hy - 30], [hx - 35, hy - 15], [hx, hy]], { seed: 500 + cycle, boil, color: palette.stroke, alpha: palette.strokeAlpha * fade, width: 2 });
      sketch(ctx, sparklePts(hx, hy, 7, 2), { seed: 501 + cycle, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha * fade, width: 1.6, fill: palette.star, fillAlpha: 0.9 * fade });
    };

    const drawBirds = (boil: number, t: number) => {
      const base = w < 640 ? [[w * 0.3, 150]] : [[w * 0.42, 150], [w * 0.47, 132], [w * 0.5, 162]];
      base.forEach(([bx, by], i) => {
        const flap = Math.sin(t / 260 + i * 1.7) * 4;
        const x = bx + Math.sin(t / 4000 + i) * 12;
        const y = by + Math.cos(t / 3000 + i) * 6;
        sketch(ctx, [[x - 9, y - 3 - flap], [x - 4, y - 1], [x, y + 2]], { seed: 700 + i, boil, color: palette.stroke, alpha: palette.strokeAlpha, width: 2 });
        sketch(ctx, [[x, y + 2], [x + 4, y - 1], [x + 9, y - 3 - flap]], { seed: 710 + i, boil, color: palette.stroke, alpha: palette.strokeAlpha, width: 2 });
      });
    };

    /** Paper plane gliding across on a gentle wave, looping every ~40 s. */
    const drawPlane = (boil: number, t: number) => {
      if (w < 640) return;
      const period = 40000;
      const k = (t % period) / period;
      const x = -80 + k * (w + 160);
      const y = h * 0.42 + Math.sin(k * Math.PI * 4) * 30;
      const tilt = Math.cos(k * Math.PI * 4) * 0.25;
      const rot = (p: Pt): Pt => [x + p[0] * Math.cos(tilt) - p[1] * Math.sin(tilt), y + p[0] * Math.sin(tilt) + p[1] * Math.cos(tilt)];
      sketch(ctx, [[-22, -6], [22, 0], [-22, 10], [-12, 1]].map((p) => rot(p as Pt)), {
        seed: 800, boil, closed: true, color: palette.stroke, alpha: palette.strokeAlpha, width: 2, fill: palette.cloud, fillAlpha: 0.9, amp: 0.9,
      });
      sketch(ctx, [[-12, 1], [22, 0]].map((p) => rot(p as Pt)), { seed: 801, boil, color: palette.stroke, alpha: palette.strokeAlpha, width: 1.6, passes: 1 });
      // Dashed flight trail
      for (let i = 1; i <= 4; i++) {
        const kk = k - i * 0.012;
        if (kk < 0) break;
        const tx = -80 + kk * (w + 160) - 20;
        const ty = h * 0.42 + Math.sin(kk * Math.PI * 4) * 30 + 2;
        sketch(ctx, [[tx - 6, ty], [tx + 2, ty]], { seed: 810 + i, boil, color: palette.stroke, alpha: palette.strokeAlpha * (1 - i * 0.2), width: 1.6, passes: 1 });
      }
    };

    const render = (now: number) => {
      const t = now - t0;
      const boil = reduceMotion ? 0 : Math.floor(t / BOIL_INTERVAL) % BOIL_FRAMES;
      ctx.clearRect(0, 0, w, h);

      if (dark) {
        stars.forEach((st) => drawStar(st, boil, t));
        if (!reduceMotion) drawShootingStar(boil, t);
        drawMoon(boil);
      } else {
        drawSun(boil, reduceMotion ? 0 : t);
        if (!reduceMotion) {
          drawBirds(boil, t);
          drawPlane(boil, t);
        }
      }
      clouds.forEach((c) => drawCloud(c, boil));
    };

    const step = (now: number) => {
      const dt = now - last;
      if (dt >= FRAME_BUDGET) {
        const seconds = Math.min(dt, 100) / 1000;
        last = now;
        clouds.forEach((c) => {
          c.x += c.speed * seconds;
          if (c.x - 90 * c.scale > w) c.x = -90 * c.scale;
        });
        render(now);
      }
      raf = requestAnimationFrame(step);
    };

    resize();
    render(performance.now());
    if (!reduceMotion) raf = requestAnimationFrame(step);

    const onResize = () => {
      resize();
      render(performance.now());
    };
    window.addEventListener('resize', onResize);

    // Pick up token changes (wallpaper tint, theme) once ThemeSync has written the attributes
    const paletteTimer = window.setTimeout(() => {
      palette = readPalette(dark);
      render(performance.now());
    }, 50);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(paletteTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [themeMode, wallpaper]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none select-none" />;
}
