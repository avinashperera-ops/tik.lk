import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as unknown as any);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  (new PrismaClient({
    adapter: adapter as unknown as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  } as any) as unknown as PrismaClient);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export * from '@prisma/client';