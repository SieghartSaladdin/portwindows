import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleRouteError, jsonError, parseJsonBody } from '@/lib/server/http';
import { createRateLimiter, getClientIp } from '@/lib/server/rateLimit';
import { contactSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

const globalForContact = globalThis as unknown as { __auraContactLimiter?: ReturnType<typeof createRateLimiter> };
const contactLimiter = (globalForContact.__auraContactLimiter ??= createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 }));

/** Public contact form. `website` is a honeypot field that humans leave empty. */
export async function POST(request: Request) {
  const limit = contactLimiter.consume(getClientIp(request));
  if (!limit.allowed) {
    return jsonError(429, 'You have sent several messages already. Please try again later.', undefined, {
      'Retry-After': String(limit.retryAfter),
    });
  }

  const parsed = await parseJsonBody(request, contactSchema);
  if (!parsed.ok) return parsed.response;
  const { name, email, message, website } = parsed.data;

  // Bots that fill the honeypot get a normal-looking success response, but nothing is stored.
  if (website && website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    await prisma.contactMessage.create({ data: { name, email, message } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'save contact message');
  }
}
