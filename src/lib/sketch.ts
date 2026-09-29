/**
 * Hand-drawn stroke helpers for <canvas> doodles (SketchSky, SketchSignature).
 * Paths are jittered from a small repeating set of seeds so they "line boil" like
 * hand-drawn animation, and traced twice so they read like pencil going over a line.
 */

export type Pt = [number, number];

/** How long one boil drawing is held (ms). ~8 fps reads as hand-drawn, not as noise. */
export const BOIL_INTERVAL = 125;
/** Number of distinct boil drawings that repeat. Three is the classic line-boil cycle. */
export const BOIL_FRAMES = 3;

export function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function jitter(seed: number, i: number, boil: number, amp: number): Pt {
  return [
    (hash(seed * 13.1 + i * 7.7 + boil * 101.3) - 0.5) * 2 * amp,
    (hash(seed * 17.9 + i * 3.3 + boil * 53.7 + 9.1) - 0.5) * 2 * amp,
  ];
}

export interface StrokeOpts {
  seed: number;
  boil: number;
  closed?: boolean;
  amp?: number;
  width?: number;
  color: string;
  alpha?: number;
  fill?: string;
  fillAlpha?: number;
  /** Pencil passes. The second pass is thinner and uses a different jitter seed. */
  passes?: number;
}

/** Smooth curve through the (jittered) points using midpoint quadratic segments. */
export function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[], closed: boolean) {
  const n = pts.length;
  if (n < 2) return;
  ctx.beginPath();
  if (closed) {
    const start: Pt = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    ctx.moveTo(start[0], start[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % n];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath();
  } else {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}

export function sketch(ctx: CanvasRenderingContext2D, pts: Pt[], o: StrokeOpts) {
  const amp = o.amp ?? 1.3;
  const closed = o.closed ?? false;
  const passes = o.passes ?? 2;

  if (o.fill) {
    const filled = pts.map((p, i) => {
      const j = jitter(o.seed + 0.5, i, o.boil, amp * 0.6);
      return [p[0] + j[0], p[1] + j[1]] as Pt;
    });
    tracePath(ctx, filled, true);
    ctx.globalAlpha = o.fillAlpha ?? 1;
    ctx.fillStyle = o.fill;
    ctx.fill();
  }

  ctx.strokeStyle = o.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let pass = 0; pass < passes; pass++) {
    const jittered = pts.map((p, i) => {
      const j = jitter(o.seed + pass * 31.7, i, o.boil, amp * (pass === 0 ? 1 : 1.5));
      return [p[0] + j[0], p[1] + j[1]] as Pt;
    });
    tracePath(ctx, jittered, closed);
    ctx.globalAlpha = (o.alpha ?? 1) * (pass === 0 ? 1 : 0.45);
    ctx.lineWidth = (o.width ?? 2.2) * (pass === 0 ? 1 : 0.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
