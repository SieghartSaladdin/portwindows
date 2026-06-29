import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await ctx.params;
    const body = await request.json();
    const { title, description, tags, githubUrl, liveUrl } = body;
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        tags: tags || undefined,
        githubUrl: githubUrl !== undefined ? githubUrl : undefined,
        liveUrl: liveUrl !== undefined ? liveUrl : undefined,
      },
    });
    
    return NextResponse.json(project);
  } catch (error: any) {
    // P2025 is Prisma's error code for record not found
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await ctx.params;
    
    await prisma.project.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
