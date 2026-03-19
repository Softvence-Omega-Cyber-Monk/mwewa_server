// src/polls/polls-public.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PollsService } from './polls.service';
import {
  PublicPollDto,
  PublicPollResultDto,
  MessageResponseDto,
} from './dto/poll-response.dto';

@ApiTags('Public – Polls')
@Controller('polls')
export class PollsPublicController {
  constructor(private readonly pollsService: PollsService) {}

  // ─── GET /polls/active ────────────────────────────────────────────────────────
  @Get('active')
  @ApiOperation({
    summary: "Get today's active poll",
    description:
      'Returns the currently active poll with its options. ' +
      'Vote counts are **not** included — only returned after a vote is cast. ' +
      'Used to render the initial voting screen.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active poll returned successfully.',
    type: PublicPollDto,
  })
  @ApiResponse({ status: 404, description: 'No active poll at the moment.' })
  getActivePoll() {
    return this.pollsService.getActivePoll();
  }

  // ─── GET /polls/active/results ────────────────────────────────────────────────
  @Get('active/results')
  @ApiOperation({
    summary: "Get live results for today's active poll",
    description:
      'Returns real-time vote counts and percentages for the currently active poll. ' +
      'Used to render the results view shown after a user casts their vote.',
  })
  @ApiResponse({
    status: 200,
    description: 'Live results returned successfully.',
    type: PublicPollResultDto,
  })
  @ApiResponse({ status: 404, description: 'No active poll at the moment.' })
  getActivePollResults() {
    return this.pollsService.getActivePollResults();
  }

  // ─── GET /polls/:id/results ───────────────────────────────────────────────────
  @Get(':id/results')
  @ApiOperation({
    summary: 'Get results for any published poll',
    description:
      'Returns the final vote counts and percentages for a specific poll. ' +
      'Works for both ACTIVE and CLOSED polls. ' +
      'Useful for the Poll History "View" button on the admin panel and public archive pages.',
  })
  @ApiParam({ name: 'id', description: 'The poll ID (cuid)', example: 'clpoll456abc' })
  @ApiResponse({
    status: 200,
    description: 'Poll results returned successfully.',
    type: PublicPollResultDto,
  })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  @ApiResponse({ status: 400, description: 'Poll is still in DRAFT status — not publicly accessible.' })
  getPollResults(@Param('id') id: string) {
    return this.pollsService.getClosedPollResults(id);
  }
}
