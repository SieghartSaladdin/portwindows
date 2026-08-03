import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/portfolio_db?schema=public",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
