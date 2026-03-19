// src/polls/polls.module.ts
import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsPublicController } from './polls-public.controller';
import { PollsAdminController } from './polls-admin.controller';

@Module({
  controllers: [PollsPublicController, PollsAdminController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
