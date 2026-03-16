import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Progress,
  ProgressDocument,
} from '../progress/schemas/progress.schema';
import { UsersService } from '../users/users.service';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  grade: string;
  totalListeningTime: number;
  booksCompleted: number;
  score: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private readonly usersService: UsersService,
  ) {}

  private async buildRankedList(grade?: string): Promise<LeaderboardEntry[]> {
    const allProgress = await this.progressModel.find().lean().exec();

    // Group by userId
    const userMap = new Map<
      string,
      { totalListeningTime: number; booksCompleted: number }
    >();

    for (const p of allProgress) {
      const existing = userMap.get(p.userId) ?? {
        totalListeningTime: 0,
        booksCompleted: 0,
      };

      existing.totalListeningTime += p.currentTime;

      // Consider a book completed if >= 90% listened
      if (p.duration > 0 && p.currentTime / p.duration >= 0.9) {
        existing.booksCompleted += 1;
      }

      userMap.set(p.userId, existing);
    }

    // Enrich with user info and compute score
    const entries: LeaderboardEntry[] = [];

    for (const [userId, stats] of userMap.entries()) {
      let userInfo: { fullName: string; grade: string } | null = null;

      try {
        const user = await this.usersService.findById(userId);
        userInfo = { fullName: user.fullName, grade: user.grade };
      } catch {
        // User deleted or not found – skip
        continue;
      }

      // Filter by grade if provided
      if (grade && userInfo.grade !== grade) continue;

      // Score: 1 point per second + 600 point bonus per completed book
      const score = stats.totalListeningTime + stats.booksCompleted * 600;

      entries.push({
        rank: 0, // assigned below
        userId,
        fullName: userInfo.fullName,
        grade: userInfo.grade,
        totalListeningTime: stats.totalListeningTime,
        booksCompleted: stats.booksCompleted,
        score,
      });
    }

    // Sort by score descending, assign rank
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => (e.rank = i + 1));

    return entries;
  }

  async getLeaderboard(
    grade?: string,
    limit = 10,
  ): Promise<{ data: LeaderboardEntry[]; total: number }> {
    const ranked = await this.buildRankedList(grade);
    const data = ranked.slice(0, limit);
    return { data, total: data.length };
  }

  async getMyRank(userId: string): Promise<LeaderboardEntry | null> {
    const ranked = await this.buildRankedList();
    return ranked.find((e) => e.userId === userId) ?? null;
  }
}
