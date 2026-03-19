// src/votes/votes.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Ip, Post, Headers } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { AlreadyVotedResponseDto, VoteResponseDto } from './dto/vote-response.dto';

@ApiTags('Public – Voting')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  // ─── POST /votes ──────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cast a vote on the active poll',
    description: `
Submits a vote for the specified option on the currently active poll.

**Anonymous de-duplication strategy:**
A SHA-256 hash of \`pollId + client IP + User-Agent\` is generated as a *voter token*.
This token is stored alongside the vote and a unique constraint \`(pollId, voterToken)\`
prevents double-voting without requiring user accounts.

**Response variants:**
- **New vote** (\`alreadyVoted: false\`): Returns the vote ID, chosen option, and updated live results.
- **Duplicate vote** (\`alreadyVoted: true\`): Returns code \`already_voted\` and current results —
  the frontend should show the results view without displaying an error.

Both cases return HTTP **200** so the client can always render results after this call.
    `.trim(),
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'Browser / client User-Agent string (used for anonymous de-duplication)',
    required: false,
  })
  @ApiBody({ type: CastVoteDto })
  @ApiResponse({
    status: 200,
    description:
      'Vote recorded (or duplicate detected). ' +
      'Check `alreadyVoted` boolean to distinguish the two cases.',
    schema: {
      oneOf: [
        {
          title: 'New vote',
          example: {
            alreadyVoted: false,
            voteId: 'clvote789',
            pollId: 'clpoll456',
            optionId: 'clopt123',
            optionLabel: 'Not Sure',
            totalVotes: 12459,
            options: [
              { id: 'clopt001', label: 'Yes', order: 0, voteCount: 6963, percentage: 55.9 },
              { id: 'clopt002', label: 'No', order: 1, voteCount: 4878, percentage: 39.2 },
              { id: 'clopt003', label: 'Not Sure', order: 2, voteCount: 618, percentage: 5.0 },
            ],
          },
        },
        {
          title: 'Already voted',
          example: {
            alreadyVoted: true,
            code: 'already_voted',
            message: 'You have already voted on this poll.',
            totalVotes: 12459,
            options: [
              { id: 'clopt001', label: 'Yes', order: 0, voteCount: 6963, percentage: 55.9 },
              { id: 'clopt002', label: 'No', order: 1, voteCount: 4878, percentage: 39.2 },
              { id: 'clopt003', label: 'Not Sure', order: 2, voteCount: 618, percentage: 5.0 },
            ],
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Poll is not active (already closed or still a draft).' })
  @ApiResponse({ status: 404, description: 'Option ID not found.' })
  castVote(
    @Body() dto: CastVoteDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.votesService.castVote(dto.optionId, ip ?? 'unknown', userAgent ?? 'unknown');
  }
}
