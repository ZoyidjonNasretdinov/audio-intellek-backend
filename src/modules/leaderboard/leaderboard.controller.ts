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

  @Get()
  async getLeaderboard(
    @Query('grade') grade?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getLeaderboard(grade, parsedLimit);
  }

  @Get('me/:userId')
  async getMyRank(@Param('userId') userId: string) {
    const entry = await this.leaderboardService.getMyRank(userId);
    if (!entry) {
      // Foydalanuvchi hali kitob eshitmagan bo'lsa, xato o'rniga default qaytaramiz
      return {
        rank: 0,
        userId,
        fullName: 'Siz',
        gender: 'Erkak',
        grade: '',
        totalListeningTime: 0,
        booksCompleted: 0,
        score: 0
      };
    }
    return entry;
  }
}
