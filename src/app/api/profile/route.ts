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
      return NextResponse.json({ error: 'Sesi telah berakhir atau tidak sah. Silakan login kembali ke Developer Hub.' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, title, location, email, bio, githubUrl, linkedinUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }
    
    const profile = await prisma.profile.upsert({
      where: { id: '1' },
      update: {
        name: name.trim(),
        title: title ? title.trim() : '',
        location: location ? location.trim() : '',
        email: email ? email.trim() : '',
        bio: bio ? bio.trim() : '',
        githubUrl: githubUrl ? githubUrl.trim() : null,
        linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
      },
      create: {
        id: '1',
        name: name.trim(),
        title: title ? title.trim() : '',
        location: location ? location.trim() : '',
        email: email ? email.trim() : '',
        bio: bio ? bio.trim() : '',
        githubUrl: githubUrl ? githubUrl.trim() : null,
        linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
      },
    });
    
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('API Profile PUT Error:', error);
    return NextResponse.json({ error: error?.message || 'Gagal memperbarui profil di database.' }, { status: 500 });
  }
}
