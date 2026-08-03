import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/client/client";
import { DUMMY_PROFILE, DUMMY_PROJECTS, DUMMY_SKILLS, DUMMY_EXPERIENCES } from '../src/lib/data';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/portfolio_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('================================================================');
  console.log('🌱 Seeding database with initial DUMMY data (Alex Mercer)...');
  console.log('================================================================');

  // 1. Seed Profile Dummy Data
  await prisma.profile.deleteMany();
  await prisma.profile.create({
    data: {
      id: '1',
      name: DUMMY_PROFILE.name,
      title: DUMMY_PROFILE.title,
      location: DUMMY_PROFILE.location,
      email: DUMMY_PROFILE.email,
      bio: DUMMY_PROFILE.bio,
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
    },
  });
  console.log('✅ Seeded dummy profile: Alex Mercer');

  // 2. Seed Projects Dummy Data
  await prisma.project.deleteMany();
  for (const project of DUMMY_PROJECTS) {
    await prisma.project.create({
      data: {
        id: project.id,
        title: project.title,
        description: project.description,
        tags: project.tags,
        githubUrl: project.githubUrl || null,
        liveUrl: project.liveUrl || null,
        images: project.images || [],
        featured: project.featured || false,
      },
    });
  }
  console.log(`✅ Seeded ${DUMMY_PROJECTS.length} dummy projects`);

  // 3. Seed Skills Dummy Data
  await prisma.skill.deleteMany();
  for (const skillGroup of DUMMY_SKILLS) {
    await prisma.skill.create({
      data: {
        category: skillGroup.category,
        skills: skillGroup.skills,
      },
    });
  }
  console.log(`✅ Seeded ${DUMMY_SKILLS.length} dummy skill groups`);

  // 4. Seed Experiences Dummy Data
  await prisma.experience.deleteMany();
  for (const exp of DUMMY_EXPERIENCES) {
    await prisma.experience.create({
      data: {
        role: exp.role,
        company: exp.company,
        duration: exp.duration,
        description: exp.description,
      },
    });
  }
  console.log(`✅ Seeded ${DUMMY_EXPERIENCES.length} dummy experience entries`);

  console.log('================================================================');
  console.log('🚀 Database seeding complete! You can edit these anytime in /admin');
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
