import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgeGroup, Gender, Province } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitDemographicsDto {
  @ApiProperty({
    enum: Province,
    example: Province.LUSAKA,
    description: 'Province selected by the voter (anonymous demographic signal).',
  })
  @IsEnum(Province)
  province!: Province;

  @ApiProperty({
    enum: AgeGroup,
    example: AgeGroup.AGE_25_34,
    description: 'Age group selected by the voter (anonymous demographic signal).',
  })
  @IsEnum(AgeGroup)
  ageGroup!: AgeGroup;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.FEMALE,
    description: 'Optional gender selection. This field may be omitted.',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}

export class SubmitQuestionSuggestionDto {
  @ApiPropertyOptional({
    example: 'How should public transport be improved in Lusaka over the next two years?',
    maxLength: 200,
    description:
      'Optional idea for a future national question. If omitted, this step is treated as skipped.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  questionSuggestion?: string;
}

export class PostVoteStepResponseDto {
  @ApiProperty({
    example: 'Post-vote data saved successfully.',
  })
  message!: string;

  @ApiProperty({
    example: false,
    description: 'True when the optional step was intentionally skipped by sending no input.',
  })
  skipped!: boolean;
}
