// src/polls/polls.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { PollHistoryQueryDto } from './dto/poll-history-query.dto';
import { PollStatus } from '@prisma/client';
import { UserQuestionSuggestionsQueryDto } from './dto/user-data.dto';

@Injectable()
export class PollsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private buildPollWithResults(poll: any) {
    const totalVotes = poll.options.reduce(
      (sum: number, o: any) => sum + (o._count?.votes ?? 0),
      0,
    );

    const options = poll.options.map((o: any) => {
      const count = o._count?.votes ?? 0;
      return {
        id: o.id,
        label: o.label,
        order: o.order,
        voteCount: count,
        percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 1000) / 10 : 0,
      };
    });

    return { ...poll, totalVotes, options };
  }

  private toPercentage(count: number, total: number) {
    if (total === 0) return 0;
    return Math.round((count / total) * 1000) / 10;
  }

  private async ensurePollExists(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });
    if (!poll) throw new NotFoundException('Poll not found');
  }

  // ─── Public ──────────────────────────────────────────────────────────────────

  /** Returns the single ACTIVE poll (public voter view — no vote counts) */
  async getActivePoll() {
    const poll = await this.prisma.poll.findFirst({
      where: { status: PollStatus.ACTIVE },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    if (!poll) throw new NotFoundException('No active poll at the moment');

    const totalVotes = poll.options.reduce((s, o) => s + o._count.votes, 0);

    return {
      id: poll.id,
      question: poll.question,
      closesAt: poll.closesAt,
      nextPollAt: poll.nextPollAt,
      totalVotes,
      options: poll.options.map((o) => ({ id: o.id, label: o.label, order: o.order })),
    };
  }

  /** Returns results for the active poll (shown after voting) */
  async getActivePollResults() {
    const poll = await this.prisma.poll.findFirst({
      where: { status: PollStatus.ACTIVE },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    if (!poll) throw new NotFoundException('No active poll at the moment');
    return this.buildPollWithResults(poll);
  }

  /** Returns results for any closed poll by id (public) */
  async getClosedPollResults(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.status === PollStatus.DRAFT)
      throw new BadRequestException('Poll results are not publicly available for drafts');

    return this.buildPollWithResults(poll);
  }

  // ─── Admin – CRUD ────────────────────────────────────────────────────────────

  async createPoll(dto: CreatePollDto) {
    const closesAt = dto.closesAt ? new Date(dto.closesAt) : null;
    const nextPollAt = dto.nextPollAt ? new Date(dto.nextPollAt) : null;

    const poll = await this.prisma.poll.create({
      data: {
        title: dto.title,
        question: dto.question,
        status: PollStatus.DRAFT,
        closesAt,
        nextPollAt,
        options: {
          create: dto.options.map((label, index) => ({ label, order: index })),
        },
      },
      include: { options: { orderBy: { order: 'asc' } } },
    });

    return poll;
  }

  async updatePoll(pollId: string, dto: UpdatePollDto) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');

    if (poll.status === PollStatus.CLOSED)
      throw new BadRequestException('Closed polls cannot be edited');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.question !== undefined) data.question = dto.question;
    if (dto.closesAt !== undefined) data.closesAt = new Date(dto.closesAt);
    if (dto.nextPollAt !== undefined) data.nextPollAt = new Date(dto.nextPollAt);

    // If options are provided, replace them entirely
    if (dto.options && dto.options.length > 0) {
      if (poll.status === PollStatus.ACTIVE) {
        throw new BadRequestException(
          'Cannot replace options on an active poll — votes already exist. ' +
            'Edit the question/title/timing only.',
        );
      }
      await this.prisma.pollOption.deleteMany({ where: { pollId } });
      data.options = {
        create: dto.options.map((label, index) => ({ label, order: index })),
      };
    }

    return this.prisma.poll.update({
      where: { id: pollId },
      data,
      include: { options: { orderBy: { order: 'asc' } } },
    });
  }

  async deletePoll(pollId: string) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');

    if (poll.status === PollStatus.ACTIVE)
      throw new BadRequestException('Cannot delete an active poll. Close it first.');

    await this.prisma.poll.delete({ where: { id: pollId } });
    return { message: 'Poll deleted successfully' };
  }

  // ─── Admin – Status transitions ──────────────────────────────────────────────

  async publishPoll(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.status === PollStatus.ACTIVE)
      throw new ConflictException('Poll is already active');
    if (poll.status === PollStatus.CLOSED)
      throw new ConflictException('A closed poll cannot be re-published');
    if (poll.options.length < 2)
      throw new BadRequestException('A poll must have at least 2 options before publishing');

    // Only one poll can be ACTIVE at a time
    const existingActive = await this.prisma.poll.findFirst({
      where: { status: PollStatus.ACTIVE },
    });
    if (existingActive)
      throw new ConflictException(
        `Poll "${existingActive.id}" is already active. Close it before publishing a new one.`,
      );

    const now = new Date();
    // Default closing: 24 h from now unless already set
    const closesAt =
      poll.closesAt && poll.closesAt > now
        ? poll.closesAt
        : new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.poll.update({
      where: { id: pollId },
      data: { status: PollStatus.ACTIVE, publishedAt: now, closesAt },
      include: { options: { orderBy: { order: 'asc' } } },
    });
  }

  async closePoll(pollId: string) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.status !== PollStatus.ACTIVE)
      throw new BadRequestException('Only an active poll can be manually closed');

    return this.prisma.poll.update({
      where: { id: pollId },
      data: { status: PollStatus.CLOSED },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
    });
  }

  // ─── Admin – Queries ─────────────────────────────────────────────────────────

  async getAllDrafts() {
    return this.prisma.poll.findMany({
      where: { status: PollStatus.DRAFT },
      include: { options: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminActivePoll() {
    const poll = await this.prisma.poll.findFirst({
      where: { status: PollStatus.ACTIVE },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
    });
    if (!poll) throw new NotFoundException('No active poll');
    return this.buildPollWithResults(poll);
  }

  async getPollById(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
      },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    return this.buildPollWithResults(poll);
  }

  async getPollHistory(query: PollHistoryQueryDto) {
    const { page = 1, limit = 10, search, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: { in: [PollStatus.ACTIVE, PollStatus.CLOSED] },
    };

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.publishedAt = {};
      if (dateFrom) where.publishedAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.publishedAt.lte = end;
      }
    }

    const [total, polls] = await Promise.all([
      this.prisma.poll.count({ where }),
      this.prisma.poll.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
            include: { _count: { select: { votes: true } } },
          },
        },
      }),
    ]);

    const data = polls.map((poll) => {
      const totalVotes = poll.options.reduce((s, o) => s + o._count.votes, 0);
      const winning = poll.options.reduce(
        (best, o) => (o._count.votes > (best?._count?.votes ?? -1) ? o : best),
        poll.options[0],
      );
      const winningPercentage =
        totalVotes > 0
          ? Math.round((winning._count.votes / totalVotes) * 1000) / 10
          : 0;

      return {
        id: poll.id,
        question: poll.question,
        publishedAt: poll.publishedAt,
        totalVotes,
        winningOption: winning?.label ?? '—',
        winningPercentage,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminDashboardStats() {
    const [activePoll, totalPollsCount, totalVotesResult] = await Promise.all([
      this.prisma.poll.findFirst({
        where: { status: PollStatus.ACTIVE },
        include: {
          options: {
            orderBy: { order: 'asc' },
            include: { _count: { select: { votes: true } } },
          },
        },
      }),
      this.prisma.poll.count({ where: { status: { not: PollStatus.DRAFT } } }),
      this.prisma.vote.count({
        where: {
          poll: {
            status: PollStatus.ACTIVE,
          },
        },
      }),
    ]);

    let activePollData = null;
    if (activePoll) {
      activePollData = this.buildPollWithResults(activePoll);
    }

    return {
      totalVotesToday: totalVotesResult,
      totalPolls: totalPollsCount,
      activePoll: activePollData,
    };
  }

  async getPollDemographics(pollId: string) {
    await this.ensurePollExists(pollId);

    const [totalResponses, provinceGroups, ageGroups, genderGroups] = await Promise.all([
      this.prisma.postVoteInsight.count({ where: { pollId } }),
      this.prisma.postVoteInsight.groupBy({
        by: ['province'],
        where: { pollId, province: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { province: 'desc' } },
      }),
      this.prisma.postVoteInsight.groupBy({
        by: ['ageGroup'],
        where: { pollId, ageGroup: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { ageGroup: 'desc' } },
      }),
      this.prisma.postVoteInsight.groupBy({
        by: ['gender'],
        where: { pollId, gender: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { gender: 'desc' } },
      }),
    ]);

    const totalWithProvince = provinceGroups.reduce((sum, item) => sum + item._count._all, 0);
    const totalWithAgeGroup = ageGroups.reduce((sum, item) => sum + item._count._all, 0);
    const totalWithGender = genderGroups.reduce((sum, item) => sum + item._count._all, 0);

    return {
      totals: {
        totalResponses,
        totalWithProvince,
        totalWithAgeGroup,
        totalWithGender,
      },
      provinceDistribution: provinceGroups.map((item) => ({
        province: item.province!,
        count: item._count._all,
        percentage: this.toPercentage(item._count._all, totalWithProvince),
      })),
      ageDistribution: ageGroups.map((item) => ({
        ageGroup: item.ageGroup!,
        count: item._count._all,
        percentage: this.toPercentage(item._count._all, totalWithAgeGroup),
      })),
      genderDistribution: genderGroups.map((item) => ({
        gender: item.gender!,
        count: item._count._all,
        percentage: this.toPercentage(item._count._all, totalWithGender),
      })),
    };
  }

  async getPollQuestionSuggestions(pollId: string, query: UserQuestionSuggestionsQueryDto) {
    await this.ensurePollExists(pollId);

    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      pollId,
      questionSuggestion: { not: null },
    };

    if (search) {
      where.questionSuggestion = {
        not: null,
        contains: search,
        mode: 'insensitive',
      };
    }

    const [total, suggestions] = await Promise.all([
      this.prisma.postVoteInsight.count({ where }),
      this.prisma.postVoteInsight.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          questionSuggestion: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: suggestions.map((s) => ({
        id: s.id,
        questionSuggestion: s.questionSuggestion!,
        createdAt: s.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportPollQuestionSuggestions(pollId: string, search?: string) {
    await this.ensurePollExists(pollId);

    const where: any = {
      pollId,
      questionSuggestion: { not: null },
    };

    if (search) {
      where.questionSuggestion = {
        not: null,
        contains: search,
        mode: 'insensitive',
      };
    }

    const suggestions = await this.prisma.postVoteInsight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        questionSuggestion: true,
        createdAt: true,
      },
    });

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = 'id,questionSuggestion,createdAt';
    const lines = suggestions.map((row) =>
      [
        escapeCsv(row.id),
        escapeCsv(row.questionSuggestion ?? ''),
        escapeCsv(row.createdAt.toISOString()),
      ].join(','),
    );

    return [header, ...lines].join('\n');
  }

  // ─── Cron helper (called by scheduler) ──────────────────────────────────────

  async closeExpiredPolls() {
    const now = new Date();
    const expired = await this.prisma.poll.findMany({
      where: {
        status: PollStatus.ACTIVE,
        closesAt: { lte: now },
      },
    });

    if (expired.length === 0) return [];

    const ids = expired.map((p) => p.id);
    await this.prisma.poll.updateMany({
      where: { id: { in: ids } },
      data: { status: PollStatus.CLOSED },
    });

    return ids;
  }
}
