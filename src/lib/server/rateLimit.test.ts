import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, getClientIp } from './rateLimit';

test('allows up to the limit, then blocks until the window resets', () => {
  let now = 1_000_000;
  const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => now });

  assert.equal(limiter.consume('a').allowed, true);
  assert.equal(limiter.consume('a').allowed, true);
  const third = limiter.consume('a');
  assert.equal(third.allowed, true);
  assert.equal(third.remaining, 0);

  const fourth = limiter.consume('a');
  assert.equal(fourth.allowed, false);
  assert.equal(fourth.retryAfter, 60);

  now += 30_000;
  assert.equal(limiter.consume('a').allowed, false);
  assert.equal(limiter.consume('a').retryAfter, 30);

  now += 30_001;
  assert.equal(limiter.consume('a').allowed, true);
});

test('keys are independent and reset() clears a key', () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
  assert.equal(limiter.consume('a').allowed, true);
  assert.equal(limiter.consume('a').allowed, false);
  assert.equal(limiter.consume('b').allowed, true);
  limiter.reset('a');
  assert.equal(limiter.consume('a').allowed, true);
});

test('getClientIp prefers the first X-Forwarded-For hop', () => {
  const req = (headers: Record<string, string>) => new Request('http://localhost/', { headers });
  assert.equal(getClientIp(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })), '203.0.113.7');
  assert.equal(getClientIp(req({ 'x-real-ip': '198.51.100.2' })), '198.51.100.2');
  assert.equal(getClientIp(req({})), 'unknown');
});
