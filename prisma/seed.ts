import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/client/client";
import { PROFILE, PROJECTS, SKILLS, EXPERIENCES } from '../src/lib/data';

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Profile
  await prisma.profile.deleteMany();
  await prisma.profile.create({
    data: {
      id: '1',
      name: PROFILE.name,
      title: PROFILE.title,
      location: PROFILE.location,
      email: PROFILE.email,
      bio: PROFILE.bio,
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
    },
  });
  console.log('Seeded profile');

  // 2. Seed Projects
  await prisma.project.deleteMany();
  for (const project of PROJECTS) {
    await prisma.project.create({
      data: {
        id: project.id,
        title: project.title,
        description: project.description,
        tags: project.tags, // JSON array
        githubUrl: project.githubUrl || null,
        liveUrl: project.liveUrl || null,
      },
    });
  }
  console.log('Seeded projects');

  // 3. Seed Skills
  await prisma.skill.deleteMany();
  for (const skillGroup of SKILLS) {
    await prisma.skill.create({
      data: {
        category: skillGroup.category,
        skills: skillGroup.skills, // JSON array
      },
    });
  }
  console.log('Seeded skills');

  // 4. Seed Experiences
  await prisma.experience.deleteMany();
  for (const exp of EXPERIENCES) {
    await prisma.experience.create({
      data: {
        id: exp.id,
        role: exp.role,
        company: exp.company,
        duration: exp.duration,
        description: exp.description, // JSON array
      },
    });
  }
  console.log('Seeded experiences');

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
