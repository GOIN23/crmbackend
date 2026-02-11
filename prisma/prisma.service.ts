import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
config();

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(protected configService: ConfigService) {
    const dburl = configService.get('DATABASE_URL');
    console.log(dburl, 'dfsdfsdfsdfsdfsds');
    const adapter = new PrismaPg({
      connectionString: dburl as string,
    });
    super({ adapter });
  }
}
