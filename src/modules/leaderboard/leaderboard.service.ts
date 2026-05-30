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
    const pipeline: any[] = [
      {
        $group: {
          _id: '$userId',
          totalListeningTime: { $sum: '$currentTime' },
          booksCompleted: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$duration', 0] },
                    { $gte: [{ $divide: ['$currentTime', '$duration'] }, 0.9] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalQuizScore: { $sum: { $ifNull: ['$quizScore', 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: '$_id' }, '$$userId'] },
              },
            },
            { $project: { password: 0, refreshToken: 0 } },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (grade) {
      const matchNumber = grade.match(/\d+/);
      const gradeNum = matchNumber ? matchNumber[0] : grade;
      pipeline.push({ 
        $match: { 
          $or: [
            { 'user.grade': grade },
            { 'user.grade': gradeNum },
            { 'user.grade': `${gradeNum} - sinf` }
          ] 
        } 
      });
    }

    pipeline.push({
      $addFields: {
        score: {
          $round: [
            {
              $add: [
                '$totalListeningTime',
                { $multiply: ['$booksCompleted', 600] },
                { $multiply: ['$totalQuizScore', 100] },
              ],
            },
            0,
          ],
        },
      },
    });

    pipeline.push({ $sort: { score: -1 } });

    const results = await this.progressModel.aggregate(pipeline).exec();

    return results.map((r, i) => ({
      rank: i + 1,
      userId: r._id,
      fullName: r.user.fullName,
      gender: r.user.gender || 'Erkak',
      grade: r.user.grade,
      totalListeningTime: r.totalListeningTime,
      booksCompleted: r.booksCompleted,
      score: r.score,
    }));
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
