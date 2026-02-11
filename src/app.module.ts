import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractsController } from './parsing/contracts.controller';
import { ZakupkiUnilateralRefusalService } from './parsing/application/zakupki.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, ContractsController],
  providers: [AppService, ZakupkiUnilateralRefusalService, PrismaService],
})
export class AppModule {}
