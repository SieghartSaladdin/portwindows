import crypto from 'crypto';

/** Admin session lifetime. */
export const TOKEN_TTL_SECONDS = 60 * 60 * 24;

export interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}

export class AuthConfigError extends Error {}

const globalForAuth = globalThis as unknown as { __auraDevJwtSecret?: string };

/**
 * JWT_SECRET is required in production. In development a random per-process secret is
 * generated (kept on globalThis so hot reloads don't invalidate sessions) and a warning
 * is printed once. Tokens signed with it stop working when the dev server restarts.
 */
export function getJwtSecret(): string {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new AuthConfigError('JWT_SECRET is not configured.');
  }
  if (!globalForAuth.__auraDevJwtSecret) {
    globalForAuth.__auraDevJwtSecret = crypto.randomBytes(32).toString('base64url');
    console.warn('[auth] JWT_SECRET is not set; using a random development secret. Admin sessions reset on restart.');
  }
  return globalForAuth.__auraDevJwtSecret;
}

const HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');

function sign(data: string, secret: string): Buffer {
  return crypto.createHmac('sha256', secret).update(data).digest();
}

export function signToken(payload: { username: string }, ttlSeconds = TOKEN_TTL_SECONDS): string {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ username: payload.username, iat: now, exp: now + ttlSeconds })).toString('base64url');
  const signature = sign(`${HEADER}.${body}`, secret).toString('base64url');
  return `${HEADER}.${body}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = getJwtSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    if (header !== HEADER) return null;

    const expected = sign(`${header}.${body}`, secret);
    const given = Buffer.from(signature, 'base64url');
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<JWTPayload>;
    if (typeof payload.username !== 'string' || typeof payload.exp !== 'number') return null;
    if (Date.now() / 1000 >= payload.exp) return null;
    return payload as JWTPayload;
  } catch {
    // Includes AuthConfigError in production: no secret means nobody is authenticated.
    return null;
  }
}

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader.trim());
  return match ? match[1] : null;
}

/** Returns the verified token payload, or null when the request is not authenticated. */
export function getAuthUser(request: Request): JWTPayload | null {
  const token = getAuthToken(request);
  return token ? verifyToken(token) : null;
}

export function isAuthenticated(request: Request): boolean {
  return getAuthUser(request) !== null;
}
