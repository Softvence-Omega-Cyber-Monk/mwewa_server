// src/polls/dto/poll-history-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PollHistoryQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (1-based). Defaults to 1.',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of results per page. Defaults to 10, max 50.',
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'renewable energy',
    description: 'Search term matched against poll question or title (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '2026-03-01',
    description: 'Filter polls published on or after this date (ISO-8601 date).',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-03-31',
    description: 'Filter polls published on or before this date (ISO-8601 date).',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
