import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleRouteError, requireAdmin } from '@/lib/server/http';
import { serializeMessage } from '@/lib/server/serializers';

export const dynamic = 'force-dynamic';

/** Admin inbox, newest first. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(messages.map(serializeMessage));
  } catch (error) {
    return handleRouteError(error, 'list messages');
  }
}
