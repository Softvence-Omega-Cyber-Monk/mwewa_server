// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PollsModule } from './polls/polls.module';
import { VotesModule } from './votes/votes.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    // Config — loads .env into process.env and makes ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // NestJS cron / interval scheduler
    ScheduleModule.forRoot(),

    // Global Prisma client
    PrismaModule,

    // Feature modules
    AuthModule,
    PollsModule,
    VotesModule,
    SchedulerModule,
  ],
})
export class AppModule {}
