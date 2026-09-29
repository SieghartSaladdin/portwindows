import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleRouteError, parseJsonBody, requireAdmin } from '@/lib/server/http';
import { serializeMessage } from '@/lib/server/serializers';
import { messagePatchSchema } from '@/lib/server/validation';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  const parsed = await parseJsonBody(request, messagePatchSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const message = await prisma.contactMessage.update({ where: { id }, data: { read: parsed.data.read } });
    return NextResponse.json(serializeMessage(message));
  } catch (error) {
    return handleRouteError(error, 'update message', 'Message');
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, 'delete message', 'Message');
  }
}
