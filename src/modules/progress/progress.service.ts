import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { SaveProgressDto } from './dto/save-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  // Progress saqlash / update
  async saveProgress(dto: SaveProgressDto) {
    const { userId, bookId, currentTime, duration } = dto;
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.progressModel.findOne({ userId, bookId });
    let diff = 0;

    if (existing) {
      diff = Math.max(0, currentTime - existing.currentTime);
      existing.currentTime = currentTime;
      existing.duration = duration;
      await existing.save();
    } else {
      diff = currentTime;
      const newProgress = new this.progressModel({
        userId,
        bookId,
        currentTime,
        duration,
      });
      await newProgress.save();
    }

    // Update daily activity
    if (diff > 0) {
      await this.activityModel.updateOne(
        { userId, date: today },
        { $inc: { duration: diff } },
        { upsert: true },
      );
    }

    return { success: true };
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

    let totalPercent = 0;
    progresses.forEach((p) => {
      if (p.duration > 0) {
        totalPercent += (p.currentTime / p.duration) * 100;
      }
    });

    const avgProgress = totalBooks > 0 ? totalPercent / totalBooks : 0;

    return { totalBooks, avgProgress: Math.floor(avgProgress) };
  }

  // Haftalik faollik (7 kunlik)
  async getWeeklyActivity(userId: string) {
    const today = new Date();
    const last7Days: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const activities = await this.activityModel
      .find({
        userId,
        date: { $in: last7Days },
      })
      .exec();

    // Map to result format
    const results = last7Days.map((date) => {
      const act = activities.find((a) => a.date === date);
      return {
        date,
        duration: act ? act.duration : 0,
        day: new Date(date).toLocaleDateString('uz-UZ', { weekday: 'short' }),
      };
    });

    return results;
  }

  // Quiz natijasini saqlash
  async saveQuizScore(userId: string, bookId: string, score: number) {
    const existing = await this.progressModel.findOne({ userId, bookId });
    if (existing) {
      // Faqat eng yuqori natijani saqlaymiz
      if (score > (existing.quizScore || 0)) {
        existing.quizScore = score;
        await existing.save();
      }
    } else {
      // Progress hali bo'lmasa, yangi yaratish (aslida playerdan keyin bo'lishi kerak, lekin ehtiyot shart)
      const newProgress = new this.progressModel({
        userId,
        bookId,
        currentTime: 0,
        duration: 0,
        quizScore: score,
      });
      await newProgress.save();
    }
    return { success: true };
  }
}
