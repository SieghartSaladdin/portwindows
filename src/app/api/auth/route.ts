import { NextResponse } from 'next/server';
import { AuthConfigError, signToken, TOKEN_TTL_SECONDS } from '@/lib/auth';
import { safeEqual } from '@/lib/server/crypto';
import { jsonError, parseJsonBody } from '@/lib/server/http';
import { createRateLimiter, getClientIp } from '@/lib/server/rateLimit';
import { loginSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

// 5 attempts per 15 minutes per IP; a successful login clears the counter.
const globalForLogin = globalThis as unknown as { __auraLoginLimiter?: ReturnType<typeof createRateLimiter> };
const loginLimiter = (globalForLogin.__auraLoginLimiter ??= createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 }));

export async function POST(request: Request) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) {
    return jsonError(503, 'Admin login is disabled: ADMIN_USERNAME and ADMIN_PASSWORD are not configured on the server.');
  }

  const ip = getClientIp(request);
  const limit = loginLimiter.consume(ip);
  if (!limit.allowed) {
    return jsonError(429, 'Too many login attempts. Please wait a few minutes and try again.', undefined, {
      'Retry-After': String(limit.retryAfter),
    });
  }

  const parsed = await parseJsonBody(request, loginSchema);
  if (!parsed.ok) return parsed.response;
  const { username, password } = parsed.data;

  // Evaluate both comparisons so timing does not reveal which one failed.
  const userOk = safeEqual(username, adminUsername);
  const passOk = safeEqual(password, adminPassword);
  if (!(userOk && passOk)) {
    return jsonError(401, 'Invalid username or password.');
  }

  try {
    const token = signToken({ username });
    loginLimiter.reset(ip);
    return NextResponse.json({ success: true, token, expiresIn: TOKEN_TTL_SECONDS });
  } catch (error) {
    if (error instanceof AuthConfigError) {
      return jsonError(503, 'Admin login is disabled: JWT_SECRET is not configured on the server.');
    }
    console.error('[api] login failed:', error instanceof Error ? error.message : error);
    return jsonError(500, 'Something went wrong on the server. Please try again.');
  }
}
