import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { Activity, ActivitySchema } from './schemas/activity.schema';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
    LeaderboardModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
