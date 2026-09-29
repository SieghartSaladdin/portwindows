import { existsSync } from "fs";
import { defineConfig } from "prisma/config";

// Prisma 7 does not load env files by itself. For local development, pick up .env.local
// (variables already set in the environment, e.g. in Docker, take precedence).
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/portfolio_db?schema=public",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
