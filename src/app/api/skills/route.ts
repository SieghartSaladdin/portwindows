import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany();
    return NextResponse.json(skills);
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
    const { category, skills } = body;
    
    if (!category || !skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Category and skills array are required' }, { status: 400 });
    }
    
    const skillGroup = await prisma.skill.create({
      data: {
        category,
        skills,
      },
    });
    
    return NextResponse.json(skillGroup, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
