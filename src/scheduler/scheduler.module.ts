// src/scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PollsModule } from '../polls/polls.module';

@Module({
  imports: [PollsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
