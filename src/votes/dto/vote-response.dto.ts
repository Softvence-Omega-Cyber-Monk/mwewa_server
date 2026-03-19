// src/votes/dto/vote-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PollOptionWithVotesDto } from '../../polls/dto/poll-response.dto';

export class VoteResponseDto {
  @ApiProperty({
    example: 'clvote789',
    description: 'ID of the newly created vote record',
  })
  voteId!: string;

  @ApiProperty({
    example: 'clpoll456',
    description: 'ID of the poll that was voted on',
  })
  pollId!: string;

  @ApiProperty({
    example: 'clopt123',
    description: 'ID of the chosen option',
  })
  optionId!: string;

  @ApiProperty({
    example: 'Yes',
    description: 'Label of the chosen option',
  })
  optionLabel!: string;

  @ApiProperty({
    example: 12459,
    description: 'Updated total vote count after this vote',
  })
  totalVotes!: number;

  @ApiProperty({
    type: [PollOptionWithVotesDto],
    description: 'Full updated results — used to immediately render the results view',
  })
  options!: PollOptionWithVotesDto[];
}

export class AlreadyVotedResponseDto {
  @ApiProperty({ example: 'already_voted' })
  code!: string;

  @ApiProperty({ example: 'You have already voted on this poll.' })
  message!: string;

  @ApiProperty({
    example: 12459,
    description: 'Current total votes',
  })
  totalVotes!: number;

  @ApiProperty({ type: [PollOptionWithVotesDto] })
  options!: PollOptionWithVotesDto[];
}
