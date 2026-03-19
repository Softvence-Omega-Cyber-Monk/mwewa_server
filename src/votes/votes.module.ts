// src/votes/votes.module.ts
import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
