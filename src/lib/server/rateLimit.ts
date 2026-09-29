/**
 * Tiny in-memory fixed-window rate limiter.
 *
 * State lives in the Node.js process, so limits are per instance (good enough for
 * a single-container portfolio; put a shared store in front for multi-instance deploys).
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

export interface RateLimiter {
  /** Records one hit for `key` and reports whether it is still within the limit. */
  consume(key: string): RateLimitResult;
  /** Forgets all hits for `key` (e.g. after a successful login). */
  reset(key: string): void;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
  /** Injectable clock for tests. */
  now?: () => number;
}): RateLimiter {
  const { limit, windowMs } = options;
  const now = options.now ?? Date.now;
  const buckets = new Map<string, Bucket>();

  function prune(t: number) {
    if (buckets.size < 5000) return;
    for (const [k, b] of buckets) {
      if (b.resetAt <= t) buckets.delete(k);
    }
  }

  return {
    consume(key) {
      const t = now();
      prune(t);
      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= t) {
        bucket = { count: 0, resetAt: t + windowMs };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - t) / 1000));
      return {
        allowed: bucket.count <= limit,
        remaining: Math.max(0, limit - bucket.count),
        retryAfter,
      };
    },
    reset(key) {
      buckets.delete(key);
    },
  };
}

/**
 * Best-effort client IP. Behind a reverse proxy the first X-Forwarded-For hop is used;
 * only trust this when the app is actually deployed behind a proxy you control.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
