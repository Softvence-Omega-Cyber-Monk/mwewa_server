// src/scheduler/scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PollsService } from '../polls/polls.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly pollsService: PollsService) {}

  /**
   * Runs every minute to check for polls whose closesAt has passed.
   * Any ACTIVE poll past its closesAt is automatically transitioned to CLOSED.
   *
   * Cron: "0 * * * * *"  →  every minute at :00 seconds
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handlePollExpiry() {
    try {
      const closedIds = await this.pollsService.closeExpiredPolls();
      if (closedIds.length > 0) {
        this.logger.log(`Auto-closed ${closedIds.length} expired poll(s): ${closedIds.join(', ')}`);
      }
    } catch (err) {
      this.logger.error('Error during poll expiry cron', err);
    }
  }
}
