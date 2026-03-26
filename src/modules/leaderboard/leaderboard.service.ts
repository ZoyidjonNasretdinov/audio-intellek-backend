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
  gender: string;
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

    // Bulk fetch user info
    const userIds = Array.from(userMap.keys());
    const users = await this.usersService.findByIds(userIds);
    const usersInfoMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Enrich with user info and compute score
    const entries: LeaderboardEntry[] = [];

    // Quiz ballari uchun map
    const qMap = new Map<string, { totalQuizScore: number }>();
    for (const p of allProgress) {
      const entry = qMap.get(p.userId) ?? { totalQuizScore: 0 };
      entry.totalQuizScore += p.quizScore || 0;
      qMap.set(p.userId, entry);
    }

    for (const [userId, stats] of userMap.entries()) {
      const user = usersInfoMap.get(userId);
      if (!user) continue;

      // Filter by grade if provided
      if (grade && user.grade !== grade) continue;

      // Score: 1 point per second + 600 point bonus per completed book + 100 points per correct quiz answer
      const score = Math.round(
        stats.totalListeningTime +
          stats.booksCompleted * 600 +
          (qMap.get(userId)?.totalQuizScore || 0) * 100,
      );

      entries.push({
        rank: 0, // assigned below
        userId,
        fullName: user.fullName,
        gender: user.gender || 'Erkak',
        grade: user.grade,
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
