export * from '@prisma/client';

import { PrismaClient } from '@prisma/client';

export function createPrismaClient(datasourceUrl?: string) {
  const url = datasourceUrl || process.env.DATABASE_URL || '';
  const pgbouncerUrl = url.includes('pgbouncer=') ? url : url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`;
  return new PrismaClient({ datasourceUrl: pgbouncerUrl });
}
