// src/polls/dto/update-poll.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class UpdatePollDto {
  @ApiPropertyOptional({
    example: 'Renewable Energy Investment — Updated',
    description: 'Internal admin title for the poll',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({
    example: 'Do you support increasing investment in renewable energy?',
    description: 'The question displayed to voters',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  question?: string;

  @ApiPropertyOptional({
    example: ['Support', 'Oppose', 'Neutral'],
    description: 'Full replacement list of voting options (2–6). Order is preserved.',
    type: [String],
    minItems: 2,
    maxItems: 6,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({
    example: '2026-03-20T18:00:00.000Z',
    description: 'New closing datetime for the poll (ISO-8601).',
  })
  @IsOptional()
  @IsDateString()
  closesAt?: string;

  @ApiPropertyOptional({
    example: '2026-03-21T09:00:00.000Z',
    description: 'Next poll scheduled datetime (ISO-8601).',
  })
  @IsOptional()
  @IsDateString()
  nextPollAt?: string;
}
