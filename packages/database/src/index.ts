import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL!;

const sql = neon(connectionString);
// Pass an empty options object as the second argument to satisfy the 2-argument signature
const adapter = new PrismaNeonHttp(sql, {} as any);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter as unknown as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  } as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export * from '@prisma/client';