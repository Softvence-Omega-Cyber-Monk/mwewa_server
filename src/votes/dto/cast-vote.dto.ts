// src/votes/dto/cast-vote.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CastVoteDto {
  @ApiProperty({
    example: 'clopt123abc',
    description:
      'The ID of the option the user is voting for. Must belong to the currently active poll.',
  })
  @IsString()
  @IsNotEmpty()
  optionId!: string;
}
