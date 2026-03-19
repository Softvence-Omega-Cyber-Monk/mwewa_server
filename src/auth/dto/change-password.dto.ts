// src/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Admin@1234',
    description: 'Current password for verification',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPass@5678',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
