import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * GET /leaderboard
   * GET /leaderboard?grade=10
   * GET /leaderboard?limit=20
   * GET /leaderboard?grade=9&limit=5
   */
  @Get()
  async getLeaderboard(
    @Query('grade') grade?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getLeaderboard(grade, parsedLimit);
  }

  /**
   * GET /leaderboard/me/:userId
   * Returns the requesting user's rank and score
   */
  @Get('me/:userId')
  async getMyRank(@Param('userId') userId: string) {
    const entry = await this.leaderboardService.getMyRank(userId);
    if (!entry) {
      throw new NotFoundException(
        'User not found in leaderboard. Start listening to books first!',
      );
    }
    return entry;
  }
}
