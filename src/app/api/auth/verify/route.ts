import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { jsonError } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) return jsonError(401, 'Your session has expired or is invalid. Please sign in again.');
  return NextResponse.json({ valid: true, username: user.username, expiresAt: user.exp });
}
