/**
 * Idempotent seed: creates the neutral placeholder profile row if it does not exist yet.
 * It never creates projects, people or any other content, and never overwrites data.
 *
 *   npm run db:seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/client/client";
import { EMPTY_PROFILE } from "../src/lib/data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with e.g. `node --env-file=.env.local ./node_modules/tsx/dist/cli.mjs prisma/seed.ts`.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const existing = await prisma.profile.findUnique({ where: { id: "1" } });
  if (existing) {
    console.log("Profile row already exists; nothing to seed.");
    return;
  }
  await prisma.profile.create({
    data: {
      id: "1",
      name: EMPTY_PROFILE.name,
      title: EMPTY_PROFILE.title,
      location: EMPTY_PROFILE.location,
      email: EMPTY_PROFILE.email,
      bio: EMPTY_PROFILE.bio,
    },
  });
  console.log("Created the placeholder profile. Edit it in the Developer Hub.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
