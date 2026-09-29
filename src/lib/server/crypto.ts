import crypto from 'crypto';

/**
 * Constant-time string comparison. Both values are hashed first so inputs of
 * different lengths never short-circuit (and never throw in timingSafeEqual).
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hb = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb) && a.length === b.length;
}
