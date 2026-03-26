import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Post()
  async save(@Body() dto: SaveProgressDto) {
    return this.progressService.saveProgress(dto);
  }

  @Get('user/:userId')
  async getAll(@Param('userId') userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Get('user/:userId/book/:bookId')
  async getOne(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
  ) {
    return this.progressService.getSingleProgress(userId, bookId);
  }

  @Get('user/:userId/stats')
  async stats(@Param('userId') userId: string) {
    return this.progressService.getUserStats(userId);
  }

  @Get('leaderboard')
  async leaderboard() {
    return this.leaderboardService.getLeaderboard();
  }

  @Get('user/:userId/weekly')
  async weekly(@Param('userId') userId: string) {
    return this.progressService.getWeeklyActivity(userId);
  }

  @Post('quiz')
  async saveQuiz(
    @Body() dto: { userId: string; bookId: string; score: number },
  ) {
    return this.progressService.saveQuizScore(
      dto.userId,
      dto.bookId,
      dto.score,
    );
  }
}
