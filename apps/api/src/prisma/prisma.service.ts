import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/database';

function getDatasourceUrl() {
  const url = process.env.DATABASE_URL || '';
  if (url.includes('pgbouncer=')) return url;
  return url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ datasourceUrl: getDatasourceUrl() });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
