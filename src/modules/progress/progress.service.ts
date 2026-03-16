import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { SaveProgressDto } from './dto/save-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
  ) {}

  // Progress saqlash / update
  async saveProgress(dto: SaveProgressDto) {
    const { userId, bookId, currentTime, duration } = dto;

    const existing = await this.progressModel.findOne({ userId, bookId });
    if (existing) {
      existing.currentTime = currentTime;
      existing.duration = duration;
      return existing.save();
    }

    const newProgress = new this.progressModel({ userId, bookId, currentTime, duration });
    return newProgress.save();
  }

  // Foydalanuvchi progresslari
  async getUserProgress(userId: string) {
    return this.progressModel.find({ userId }).exec();
  }

  // Bitta kitob bo‘yicha progress
  async getSingleProgress(userId: string, bookId: string) {
    return this.progressModel.findOne({ userId, bookId }).exec();
  }

  // Foydalanuvchi statistikasi
  async getUserStats(userId: string) {
    const progresses = await this.progressModel.find({ userId }).exec();
    const totalBooks = progresses.length;
    const avgProgress =
      progresses.reduce(
        (sum, p) => sum + (p.currentTime / p.duration) * 100,
        0,
      ) / totalBooks || 0;

    return { totalBooks, avgProgress: Math.floor(avgProgress) };
  }

  // Leaderboard (top 10)
  async getLeaderboard() {
    const allProgress = await this.progressModel.find().exec();
    const leaderboardMap = new Map<string, number>();

    allProgress.forEach((p) => {
      const prev = leaderboardMap.get(p.userId) || 0;
      const progressPercent = Math.floor((p.currentTime / p.duration) * 100);
      if (progressPercent > prev) leaderboardMap.set(p.userId, progressPercent);
    });

    return Array.from(leaderboardMap.entries())
      .map(([userId, progress]) => ({ userId, progress }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10);
  }
}
