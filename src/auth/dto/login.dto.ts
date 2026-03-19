// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@civicvoice.com',
    description: 'Admin account email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin@1234',
    description: 'Admin account password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
