// src/polls/dto/poll-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Option ──────────────────────────────────────────────────────────────────

export class PollOptionDto {
  @ApiProperty({ example: 'clopt123' })
  id!: string;

  @ApiProperty({ example: 'Yes' })
  label!: string;

  @ApiProperty({ example: 0 })
  order!: number;
}

export class PollOptionWithVotesDto extends PollOptionDto {
  @ApiProperty({ example: 6963, description: 'Total votes for this option' })
  voteCount!: number;

  @ApiProperty({ example: 54.2, description: 'Percentage of total votes (rounded to 1 dp)' })
  percentage!: number;
}

// ─── Poll (admin list / detail) ───────────────────────────────────────────────

export class PollDto {
  @ApiProperty({ example: 'clpoll456' })
  id!: string;

  @ApiProperty({ example: 'Renewable Energy Investment' })
  title!: string;

  @ApiProperty({ example: 'Do you support increasing investment in renewable energy?' })
  question!: string;

  @ApiProperty({ enum: ['DRAFT', 'ACTIVE', 'CLOSED'], example: 'ACTIVE' })
  status!: string;

  @ApiPropertyOptional({ example: '2026-03-16T09:00:00.000Z' })
  publishedAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-03-17T09:00:00.000Z' })
  closesAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-03-18T09:00:00.000Z' })
  nextPollAt!: Date | null;

  @ApiProperty({ example: '2026-03-15T08:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: [PollOptionDto] })
  options!: PollOptionDto[];
}

// ─── Public poll (voter view) ─────────────────────────────────────────────────

export class PublicPollDto {
  @ApiProperty({ example: 'clpoll456' })
  id!: string;

  @ApiProperty({ example: 'Do you support increasing investment in renewable energy?' })
  question!: string;

  @ApiProperty({ example: '2026-03-17T09:00:00.000Z', nullable: true })
  closesAt!: Date | null;

  @ApiProperty({ example: '2026-03-18T09:00:00.000Z', nullable: true })
  nextPollAt!: Date | null;

  @ApiProperty({ example: 12458, description: 'Total votes cast so far' })
  totalVotes!: number;

  @ApiProperty({ type: [PollOptionDto] })
  options!: PollOptionDto[];
}

// ─── Public poll results (after voting) ──────────────────────────────────────

export class PublicPollResultDto {
  @ApiProperty({ example: 'clpoll456' })
  id!: string;

  @ApiProperty({ example: 'Do you support increasing investment in renewable energy?' })
  question!: string;

  @ApiProperty({ example: '2026-03-17T09:00:00.000Z', nullable: true })
  closesAt!: Date | null;

  @ApiProperty({ example: '2026-03-18T09:00:00.000Z', nullable: true })
  nextPollAt!: Date | null;

  @ApiProperty({ example: 12459, description: 'Total votes cast' })
  totalVotes!: number;

  @ApiProperty({ type: [PollOptionWithVotesDto] })
  options!: PollOptionWithVotesDto[];
}

// ─── Admin results ────────────────────────────────────────────────────────────

export class AdminPollResultDto extends PublicPollResultDto {
  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'CLOSED'] })
  status!: string;

  @ApiPropertyOptional({ example: '2026-03-16T09:00:00.000Z' })
  publishedAt!: Date | null;

  @ApiProperty({ example: 'Yes', description: 'Label of the leading option' })
  leadingOption!: string;

  @ApiProperty({ example: 54.2, description: 'Percentage of the leading option' })
  leadingPercentage!: number;
}

// ─── Paginated poll history ────────────────────────────────────────────────────

export class PollHistoryItemDto {
  @ApiProperty({ example: 'clpoll456' })
  id!: string;

  @ApiProperty({ example: 'Do you support a four-day work week?' })
  question!: string;

  @ApiProperty({ example: '2026-03-14T00:00:00.000Z' })
  publishedAt!: Date;

  @ApiProperty({ example: 18721 })
  totalVotes!: number;

  @ApiProperty({ example: 'Yes', description: 'Label of the winning option' })
  winningOption!: string;

  @ApiProperty({ example: 71.8, description: 'Winning option percentage' })
  winningPercentage!: number;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 6 })
  total!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class PollHistoryResponseDto {
  @ApiProperty({ type: [PollHistoryItemDto] })
  data!: PollHistoryItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

// ─── Message response ─────────────────────────────────────────────────────────

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully.' })
  message!: string;
}
