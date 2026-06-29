import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: '1' },
    });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, title, location, email, bio, githubUrl, linkedinUrl } = body;
    
    const profile = await prisma.profile.upsert({
      where: { id: '1' },
      update: {
        name,
        title,
        location,
        email,
        bio,
        githubUrl,
        linkedinUrl,
      },
      create: {
        id: '1',
        name,
        title,
        location,
        email,
        bio,
        githubUrl,
        linkedinUrl,
      },
    });
    
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
