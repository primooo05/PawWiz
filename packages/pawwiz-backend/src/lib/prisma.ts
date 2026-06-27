/**
 * Singleton Pattern — Database Client
 * Instantiated once, cached, exported.
 * Prevents duplicate connections, saves memory.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Strip ?pgbouncer=true — it's a Prisma-only hint, not a valid pg parameter.
// Passing it through to the pg driver causes auth failures.
const poolUrl = process.env.DATABASE_URL?.replace(/[?&]pgbouncer=true/i, '').replace(/\?$/, '');
const pool = new pg.Pool({ connectionString: poolUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

/**
 * Verifies database connectivity on startup.
 * Exits the process with code 1 if unreachable (fail-fast).
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');
  } catch (error) {
    console.error('[DB] Failed to connect:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown — disconnect Prisma on process exit.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('[DB] Disconnected');
}

export { prisma };
