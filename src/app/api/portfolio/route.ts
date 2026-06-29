import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PROFILE, PROJECTS, SKILLS, EXPERIENCES } from '@/lib/data';

export async function GET() {
  try {
    // 1. Fetch Profile
    let profile = await prisma.profile.findUnique({ where: { id: '1' } });
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: '1',
          name: PROFILE.name,
          title: PROFILE.title,
          location: PROFILE.location,
          email: PROFILE.email,
          bio: PROFILE.bio,
        },
      });
    }

    // 2. Fetch Projects
    let projects = await prisma.project.findMany();
    if (projects.length === 0) {
      for (const p of PROJECTS) {
        await prisma.project.create({
          data: {
            id: p.id,
            title: p.title,
            description: p.description,
            tags: p.tags,
            githubUrl: p.githubUrl || null,
            liveUrl: p.liveUrl || null,
          },
        });
      }
      projects = await prisma.project.findMany();
    }

    // 3. Fetch Skills
    let skills = await prisma.skill.findMany();
    if (skills.length === 0) {
      for (const s of SKILLS) {
        await prisma.skill.create({
          data: {
            category: s.category,
            skills: s.skills,
          },
        });
      }
      skills = await prisma.skill.findMany();
    }

    // 4. Fetch Experiences
    let experiences = await prisma.experience.findMany();
    if (experiences.length === 0) {
      for (const e of EXPERIENCES) {
        await prisma.experience.create({
          data: {
            id: e.id,
            role: e.role,
            company: e.company,
            duration: e.duration,
            description: e.description,
          },
        });
      }
      experiences = await prisma.experience.findMany();
    }

    return NextResponse.json({
      profile,
      projects,
      skills,
      experiences,
    });
  } catch (error: any) {
    console.error('Failed to fetch portfolio data:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
