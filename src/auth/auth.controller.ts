// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginResponseDto, AdminProfileDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── POST /auth/login ────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description:
      'Authenticates an admin with email and password. Returns a signed JWT access token valid for 7 days.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns JWT and admin profile.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 400, description: 'Validation error — missing or invalid fields.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── GET /auth/me ────────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get current admin profile',
    description: 'Returns the authenticated admin\'s profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile returned successfully.',
    type: AdminProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  // ─── PATCH /auth/change-password ─────────────────────────────────────────────
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change admin password',
    description:
      'Allows the authenticated admin to update their password by providing the current password for verification.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
    schema: {
      example: { message: 'Password updated successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Current password is incorrect or JWT invalid.' })
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }
}
