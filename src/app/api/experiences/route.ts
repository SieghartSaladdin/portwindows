import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany();
    return NextResponse.json(experiences);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { role, company, duration, description } = body;
    
    if (!role || !company || !duration) {
      return NextResponse.json({ error: 'Role, company, and duration are required' }, { status: 400 });
    }
    
    const experience = await prisma.experience.create({
      data: {
        role,
        company,
        duration,
        description: description || [],
      },
    });
    
    return NextResponse.json(experience, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
