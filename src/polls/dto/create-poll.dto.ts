// src/polls/dto/create-poll.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreatePollDto {
  @ApiProperty({
    example: 'Renewable Energy Investment',
    description: 'Internal admin title for the poll (not shown to public)',
    maxLength: 150,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @ApiProperty({
    example: 'Do you support increasing investment in renewable energy?',
    description: 'The question displayed to voters on the public page',
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  question!: string;

  @ApiProperty({
    example: ['Yes', 'No', 'Not Sure'],
    description: 'Voting options (2–6 options). First option gets green, second red, rest grey.',
    type: [String],
    minItems: 2,
    maxItems: 6,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  options!: string[];

  @ApiPropertyOptional({
    example: '2026-03-20T00:00:00.000Z',
    description:
      'ISO-8601 datetime when the poll should automatically close. ' +
      'If omitted, defaults to 24 hours from publish time.',
  })
  @IsOptional()
  @IsDateString()
  closesAt?: string;

  @ApiPropertyOptional({
    example: '2026-03-21T00:00:00.000Z',
    description:
      'ISO-8601 datetime hinting when the next poll will be published. ' +
      'Shown to users as "Next Question in …".',
  })
  @IsOptional()
  @IsDateString()
  nextPollAt?: string;
}
