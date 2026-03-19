// src/polls/polls-admin.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { PollHistoryQueryDto } from './dto/poll-history-query.dto';
import {
  AdminPollResultDto,
  MessageResponseDto,
  PollDto,
  PollHistoryResponseDto,
} from './dto/poll-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Admin – Polls')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('admin/polls')
export class PollsAdminController {
  constructor(private readonly pollsService: PollsService) {}

  // ─── GET /admin/polls/dashboard ───────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard overview stats',
    description:
      'Returns total votes today, total published polls count, and the full active poll data. ' +
      'Powers the Dashboard Overview page (stat cards + today\'s question).',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats returned successfully.',
    schema: {
      example: {
        totalVotesToday: 12847,
        totalPolls: 24,
        activePoll: {
          id: 'clpoll456',
          question: 'Do you support increasing renewable energy investment?',
          status: 'ACTIVE',
          totalVotes: 12847,
          options: [
            { id: 'opt1', label: 'Yes', order: 0, voteCount: 6963, percentage: 54.2 },
            { id: 'opt2', label: 'No', order: 1, voteCount: 4047, percentage: 31.5 },
            { id: 'opt3', label: 'Not Sure', order: 2, voteCount: 1837, percentage: 14.3 },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid or missing JWT.' })
  getDashboard() {
    return this.pollsService.getAdminDashboardStats();
  }

  // ─── GET /admin/polls/active ──────────────────────────────────────────────────
  @Get('active')
  @ApiOperation({
    summary: 'Get the current active poll (admin view)',
    description:
      'Returns the active poll with full vote counts for the admin dashboard. ' +
      'Used by the "Today\'s Poll" edit view and Dashboard Overview.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active poll with results returned.',
    type: AdminPollResultDto,
  })
  @ApiResponse({ status: 404, description: 'No active poll.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getActivePoll() {
    return this.pollsService.getAdminActivePoll();
  }

  // ─── GET /admin/polls/drafts ──────────────────────────────────────────────────
  @Get('drafts')
  @ApiOperation({
    summary: 'List all draft polls',
    description:
      'Returns all polls with DRAFT status. ' +
      'Powers the "Manage Draft Polls" page with Publish / Edit / Delete actions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of draft polls returned.',
    type: [PollDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getDrafts() {
    return this.pollsService.getAllDrafts();
  }

  // ─── GET /admin/polls/history ─────────────────────────────────────────────────
  @Get('history')
  @ApiOperation({
    summary: 'Get paginated poll history',
    description:
      'Returns a paginated, searchable list of all published (ACTIVE + CLOSED) polls. ' +
      'Powers the "Poll History" page with search, date filtering, and pagination.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page (default 10, max 50)' })
  @ApiQuery({ name: 'search', required: false, example: 'renewable', description: 'Search term (question or title)' })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2026-03-01', description: 'Filter from date' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2026-03-31', description: 'Filter to date' })
  @ApiResponse({
    status: 200,
    description: 'Paginated poll history returned.',
    type: PollHistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getHistory(@Query() query: PollHistoryQueryDto) {
    return this.pollsService.getPollHistory(query);
  }

  // ─── GET /admin/polls/:id ─────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single poll by ID (admin)',
    description:
      'Returns full poll details including vote counts for all options. ' +
      'Used when loading the edit form or the Poll Results page.',
  })
  @ApiParam({ name: 'id', description: 'Poll ID (cuid)', example: 'clpoll456abc' })
  @ApiResponse({
    status: 200,
    description: 'Poll detail with vote counts returned.',
    type: AdminPollResultDto,
  })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getPollById(@Param('id') id: string) {
    return this.pollsService.getPollById(id);
  }

  // ─── POST /admin/polls ────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Create a new poll (saved as DRAFT)',
    description:
      'Creates a new poll in DRAFT status. ' +
      'The poll will not be visible to the public until published. ' +
      'Triggered by the "Save as Draft" button on the Create Poll form.',
  })
  @ApiBody({ type: CreatePollDto })
  @ApiResponse({
    status: 201,
    description: 'Poll created and saved as DRAFT.',
    type: PollDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createPoll(@Body() dto: CreatePollDto) {
    return this.pollsService.createPoll(dto);
  }

  // ─── POST /admin/polls/create-and-publish ─────────────────────────────────────
  @Post('create-and-publish')
  @ApiOperation({
    summary: 'Create a new poll and immediately publish it',
    description:
      'Creates a poll and sets it ACTIVE in a single operation. ' +
      'Triggered by the "Create & Publish" button. ' +
      'Fails if another poll is already active.',
  })
  @ApiBody({ type: CreatePollDto })
  @ApiResponse({
    status: 201,
    description: 'Poll created and published successfully.',
    type: PollDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 409, description: 'Another poll is already active.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createAndPublish(@Body() dto: CreatePollDto) {
    const poll = await this.pollsService.createPoll(dto);
    return this.pollsService.publishPoll(poll.id);
  }

  // ─── PATCH /admin/polls/:id ───────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing poll',
    description:
      'Partially updates a DRAFT or ACTIVE poll. ' +
      'For ACTIVE polls only question, title, closesAt and nextPollAt may be changed ' +
      '(options cannot be replaced once voting has started). ' +
      'Triggered by "Publish Changes" button on the Edit Current Poll view.',
  })
  @ApiParam({ name: 'id', description: 'Poll ID', example: 'clpoll456abc' })
  @ApiBody({ type: UpdatePollDto })
  @ApiResponse({ status: 200, description: 'Poll updated successfully.', type: PollDto })
  @ApiResponse({ status: 400, description: 'Validation error or closed poll.' })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updatePoll(@Param('id') id: string, @Body() dto: UpdatePollDto) {
    return this.pollsService.updatePoll(id, dto);
  }

  // ─── POST /admin/polls/:id/publish ───────────────────────────────────────────
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a draft poll',
    description:
      'Transitions a DRAFT poll to ACTIVE, making it live for public voting. ' +
      'Sets publishedAt to now and defaults closesAt to 24 h later if not already set. ' +
      'Only one poll can be ACTIVE at a time.',
  })
  @ApiParam({ name: 'id', description: 'Draft poll ID to publish', example: 'clpoll456abc' })
  @ApiResponse({ status: 200, description: 'Poll published successfully.', type: PollDto })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  @ApiResponse({ status: 409, description: 'Poll is already active, or another poll is currently active.' })
  @ApiResponse({ status: 400, description: 'Poll must have at least 2 options.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  publishPoll(@Param('id') id: string) {
    return this.pollsService.publishPoll(id);
  }

  // ─── POST /admin/polls/:id/close ─────────────────────────────────────────────
  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually close an active poll',
    description:
      'Immediately transitions an ACTIVE poll to CLOSED, stopping all further votes. ' +
      'The cron job does this automatically at closesAt, but this endpoint allows early closure.',
  })
  @ApiParam({ name: 'id', description: 'Active poll ID to close', example: 'clpoll456abc' })
  @ApiResponse({ status: 200, description: 'Poll closed successfully.', type: PollDto })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  @ApiResponse({ status: 400, description: 'Poll is not currently active.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  closePoll(@Param('id') id: string) {
    return this.pollsService.closePoll(id);
  }

  // ─── DELETE /admin/polls/:id ──────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a poll',
    description:
      'Permanently deletes a DRAFT or CLOSED poll and all its votes (cascade). ' +
      'An ACTIVE poll cannot be deleted — close it first. ' +
      'Triggered by the trash icon on the Draft Polls and Poll History pages.',
  })
  @ApiParam({ name: 'id', description: 'Poll ID to delete', example: 'clpoll456abc' })
  @ApiResponse({ status: 200, description: 'Poll deleted successfully.', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Active polls cannot be deleted.' })
  @ApiResponse({ status: 404, description: 'Poll not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deletePoll(@Param('id') id: string) {
    return this.pollsService.deletePoll(id);
  }
}
