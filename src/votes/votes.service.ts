// src/votes/votes.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AgeGroup, Gender, PollStatus, Province } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a deterministic, anonymous voter token.
   *
   * Strategy: SHA-256( pollId + ":" + clientIp + ":" + userAgent )
   *
   * Why this approach:
   *  - No registration or session required.
   *  - Combines IP + User-Agent to reduce false positives from shared NAT IPs
   *    (e.g. multiple users on the same office WiFi are likely to have different UAs).
   *  - The pollId is mixed in so the same person can vote on different polls.
   *  - One-way hash means we never store raw IP addresses (GDPR-friendly).
   *  - Not 100% spoof-proof, but adequate for a civic engagement platform.
   */
  private buildVoterToken(pollId: string, ip: string, userAgent: string): string {
    const raw = `${pollId}:${ip}:${userAgent}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private buildResultsFromPoll(poll: any) {
    const totalVotes = poll.options.reduce(
      (sum: number, o: any) => sum + (o._count?.votes ?? 0),
      0,
    );
    return {
      totalVotes,
      options: poll.options.map((o: any) => {
        const count = o._count?.votes ?? 0;
        return {
          id: o.id,
          label: o.label,
          order: o.order,
          voteCount: count,
          percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 1000) / 10 : 0,
        };
      }),
    };
  }

  async castVote(optionId: string, ip: string, userAgent: string) {
    // 1. Find the option and its poll
    const option = await this.prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: true },
    });

    if (!option) throw new NotFoundException('Voting option not found');

    const poll = option.poll;

    if (poll.status !== PollStatus.ACTIVE) {
      throw new BadRequestException(
        poll.status === PollStatus.CLOSED
          ? 'This poll has already closed. Voting is no longer accepted.'
          : 'This poll is not yet active.',
      );
    }

    // 2. Build the anonymous voter token
    const voterToken = this.buildVoterToken(poll.id, ip, userAgent);

    // 3. Check for duplicate vote (upsert-safe via unique constraint)
    const existing = await this.prisma.vote.findUnique({
      where: { pollId_voterToken: { pollId: poll.id, voterToken } },
    });

    // 4. Fetch current results (needed for both new vote and already-voted response)
    const pollWithCounts = await this.prisma.poll.findUnique({
      where: { id: poll.id },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    if (existing) {
      // Already voted — return current results with a clear code so the frontend
      // can distinguish and show the results view without an error toast.
      const results = this.buildResultsFromPoll(pollWithCounts);
      return {
        alreadyVoted: true,
        code: 'already_voted',
        message: 'You have already voted on this poll.',
        ...results,
      };
    }

    // 5. Record the vote
    const vote = await this.prisma.vote.create({
      data: {
        pollId: poll.id,
        optionId,
        voterToken,
      },
    });

    // 6. Re-fetch updated counts
    const updated = await this.prisma.poll.findUnique({
      where: { id: poll.id },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    const results = this.buildResultsFromPoll(updated);

    return {
      alreadyVoted: false,
      voteId: vote.id,
      pollId: poll.id,
      optionId,
      optionLabel: option.label,
      ...results,
    };
  }

  private async getActivePollForPostVoteFlow() {
    const poll = await this.prisma.poll.findFirst({
      where: { status: PollStatus.ACTIVE },
      orderBy: { publishedAt: 'desc' },
    });
    if (!poll) {
      throw new NotFoundException(
        'No active poll found. Post-vote data can only be submitted for an active poll.',
      );
    }
    return poll;
  }

  async submitDemographics(
    ip: string,
    userAgent: string,
    payload: {
      province: Province;
      ageGroup: AgeGroup;
      gender?: Gender;
    },
  ) {
    const poll = await this.getActivePollForPostVoteFlow();
    const voterToken = this.buildVoterToken(poll.id, ip, userAgent);

    await this.prisma.postVoteInsight.upsert({
      where: { pollId_voterToken: { pollId: poll.id, voterToken } },
      create: {
        pollId: poll.id,
        voterToken,
        province: payload.province,
        ageGroup: payload.ageGroup,
        gender: payload.gender ?? null,
      },
      update: {
        province: payload.province,
        ageGroup: payload.ageGroup,
        gender: payload.gender ?? null,
      },
    });

    return {
      message: 'Demographic data saved successfully.',
      skipped: false,
    };
  }

  async submitQuestionSuggestion(ip: string, userAgent: string, questionSuggestion?: string) {
    const poll = await this.getActivePollForPostVoteFlow();
    const voterToken = this.buildVoterToken(poll.id, ip, userAgent);
    const trimmedSuggestion = questionSuggestion?.trim();

    if (!trimmedSuggestion) {
      return {
        message: 'Question suggestion step skipped.',
        skipped: true,
      };
    }

    await this.prisma.postVoteInsight.upsert({
      where: { pollId_voterToken: { pollId: poll.id, voterToken } },
      create: {
        pollId: poll.id,
        voterToken,
        questionSuggestion: trimmedSuggestion,
      },
      update: {
        questionSuggestion: trimmedSuggestion,
      },
    });

    return {
      message: 'Question suggestion saved successfully.',
      skipped: false,
    };
  }

  /** Admin helper: total votes for a specific poll */
  async countVotesForPoll(pollId: string) {
    return this.prisma.vote.count({ where: { pollId } });
  }
}
