import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { formatZodError } from './validation';

export function jsonError(status: number, error: string, details?: Record<string, string>, headers?: HeadersInit) {
  return NextResponse.json(details ? { error, details } : { error }, { status, headers });
}

/** Returns a 401 response when the request has no valid admin token, otherwise null. */
export function requireAdmin(request: Request): NextResponse | null {
  if (getAuthUser(request)) return null;
  return jsonError(401, 'Your session has expired or is invalid. Please sign in to the Developer Hub again.');
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Reads the JSON body and validates it. Invalid JSON or schema errors become a 400 response. */
export async function parseJsonBody<S extends z.ZodType>(request: Request, schema: S): Promise<ParseResult<z.output<S>>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: jsonError(400, 'Request body must be valid JSON.') };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { ok: false, response: jsonError(400, 'Validation failed.', formatZodError(result.error)) };
  }
  return { ok: true, data: result.data };
}

function prismaCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
    return (error as { code: string }).code;
  }
  return undefined;
}

/**
 * Maps unexpected errors to a safe JSON response. Prisma "record not found" becomes 404;
 * everything else is logged server-side and returned as a generic 500 (no internals leaked).
 */
export function handleRouteError(error: unknown, context: string, entityLabel = 'Record'): NextResponse {
  const code = prismaCode(error);
  if (code === 'P2025') return jsonError(404, `${entityLabel} not found.`);
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[api] ${context} failed:`, message);
  if (/ECONNREFUSED|reach database|connect/i.test(message)) {
    return jsonError(503, 'The database is unreachable right now. Please try again later.');
  }
  return jsonError(500, 'Something went wrong on the server. Please try again.');
}
