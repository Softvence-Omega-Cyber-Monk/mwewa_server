import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgeGroup, Gender, Province } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UserQuestionSuggestionsQueryDto {
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
    description: 'Results per page. Defaults to 10, max 100.',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'education',
    description: 'Case-insensitive search on submitted suggestion text.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ProvinceDistributionItemDto {
  @ApiProperty({ enum: Province, example: Province.LUSAKA })
  province!: Province;

  @ApiProperty({ example: 284 })
  count!: number;

  @ApiProperty({ example: 32.4 })
  percentage!: number;
}

export class AgeDistributionItemDto {
  @ApiProperty({ enum: AgeGroup, example: AgeGroup.AGE_25_34 })
  ageGroup!: AgeGroup;

  @ApiProperty({ example: 197 })
  count!: number;

  @ApiProperty({ example: 27.9 })
  percentage!: number;
}

export class GenderDistributionItemDto {
  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  gender!: Gender;

  @ApiProperty({ example: 152 })
  count!: number;

  @ApiProperty({ example: 46.2 })
  percentage!: number;
}

export class UserDataTotalsDto {
  @ApiProperty({ example: 811, description: 'Total anonymous post-vote records for this poll.' })
  totalResponses!: number;

  @ApiProperty({ example: 778, description: 'Responses that included a province.' })
  totalWithProvince!: number;

  @ApiProperty({ example: 706, description: 'Responses that included an age group.' })
  totalWithAgeGroup!: number;

  @ApiProperty({ example: 329, description: 'Responses that included a gender value.' })
  totalWithGender!: number;
}

export class PollDemographicsResponseDto {
  @ApiProperty({ type: UserDataTotalsDto })
  totals!: UserDataTotalsDto;

  @ApiProperty({ type: [ProvinceDistributionItemDto] })
  provinceDistribution!: ProvinceDistributionItemDto[];

  @ApiProperty({ type: [AgeDistributionItemDto] })
  ageDistribution!: AgeDistributionItemDto[];

  @ApiProperty({ type: [GenderDistributionItemDto] })
  genderDistribution!: GenderDistributionItemDto[];
}

export class QuestionSuggestionItemDto {
  @ApiProperty({ example: 'clqstn123abc' })
  id!: string;

  @ApiProperty({
    example: 'How should the government improve youth employment opportunities?',
  })
  questionSuggestion!: string;

  @ApiProperty({ example: '2026-03-20T10:32:11.000Z' })
  createdAt!: Date;
}

export class QuestionSuggestionsResponseDto {
  @ApiProperty({ type: [QuestionSuggestionItemDto] })
  data!: QuestionSuggestionItemDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 42,
      totalPages: 5,
    },
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
