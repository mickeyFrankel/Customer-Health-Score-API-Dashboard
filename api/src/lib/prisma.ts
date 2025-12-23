import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function checkDatabaseHealth(): Promise<'ok' | 'degraded'> {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return 'ok';
  } catch (error) {
    return 'degraded';
  }
}
