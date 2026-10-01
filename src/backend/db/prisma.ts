import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Always guarantee a default fallback for DATABASE_URL if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

// Support Vercel serverless runtime with SQLite
if (process.env.VERCEL) {
  const currentDbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  if (currentDbUrl.startsWith('file:') && !currentDbUrl.includes('/tmp/')) {
    try {
      const tmpPath = '/tmp/dev.db';
      if (!fs.existsSync(tmpPath)) {
        const candidates = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
          path.resolve('./prisma/dev.db'),
        ];
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            fs.copyFileSync(candidate, tmpPath);
            break;
          }
        }
      }
      process.env.DATABASE_URL = `file:${tmpPath}`;
    } catch (err) {
      console.error('[Prisma Vercel] Error preparing /tmp database:', err);
    }
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
