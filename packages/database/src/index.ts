import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neonConfig, neon } from '@neondatabase/serverless';

// Disable fetch polyfill issues if necessary
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL!;

// Use standard HTTP client adapter over port 443
const sql = neon(connectionString);
const adapter = new PrismaNeonHTTP(sql);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter as unknown as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export * from '@prisma/client';