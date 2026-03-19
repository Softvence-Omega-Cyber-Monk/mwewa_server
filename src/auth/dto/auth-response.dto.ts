// src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty({ example: 'clxyz123', description: 'Admin unique ID' })
  id!: string;

  @ApiProperty({ example: 'admin@civicvoice.com' })
  email!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT Bearer token' })
  accessToken!: string;

  @ApiProperty({ type: AdminProfileDto })
  admin!: AdminProfileDto;
}
