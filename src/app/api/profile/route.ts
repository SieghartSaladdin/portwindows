import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleRouteError, jsonError, parseJsonBody, requireAdmin } from '@/lib/server/http';
import { PROFILE_ID } from '@/lib/server/portfolio';
import { serializeProfile } from '@/lib/server/serializers';
import { profileSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
    if (!profile) return jsonError(404, 'Profile not found.');
    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    return handleRouteError(error, 'get profile', 'Profile');
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const parsed = await parseJsonBody(request, profileSchema);
  if (!parsed.ok) return parsed.response;
  const d = parsed.data;

  try {
    const profile = await prisma.profile.upsert({
      where: { id: PROFILE_ID },
      // Fields omitted from the body are left untouched.
      update: d,
      create: {
        id: PROFILE_ID,
        name: d.name,
        title: d.title ?? '',
        location: d.location ?? '',
        email: d.email ?? '',
        bio: d.bio ?? '',
        githubUrl: d.githubUrl ?? null,
        linkedinUrl: d.linkedinUrl ?? null,
        websiteUrl: d.websiteUrl ?? null,
        phone: d.phone ?? null,
        avatarUrl: d.avatarUrl ?? null,
        resumeUrl: d.resumeUrl ?? null,
      },
    });
    return NextResponse.json(serializeProfile(profile));
  } catch (error) {
    return handleRouteError(error, 'update profile', 'Profile');
  }
}
