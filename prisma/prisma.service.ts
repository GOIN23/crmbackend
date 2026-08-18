import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'generated/prisma/client';
config();

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(protected configService: ConfigService) {
    const dburl = configService.get('DATABASE_URL');
    const adapter = new PrismaPg({
      connectionString: dburl as string,
    });
    super({ adapter });
  }
}
