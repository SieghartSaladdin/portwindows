import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/client/client";

const DEV_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/portfolio_db?schema=public";

const globalForPrisma = globalThis as unknown as { __auraPrisma?: PrismaClient };

function createClient(): PrismaClient {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      // Don't throw at import time (next build evaluates route modules); queries will fail instead.
      console.error("[db] DATABASE_URL is not set. Database queries will fail until it is configured.");
    } else {
      connectionString = DEV_DATABASE_URL;
      console.warn("[db] DATABASE_URL is not set; falling back to the local development database.");
    }
  }
  const pool = new Pool({ connectionString });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

// Reuse one client per process (also survives Next.js hot reloads in development).
export const prisma = globalForPrisma.__auraPrisma ?? createClient();
globalForPrisma.__auraPrisma = prisma;
