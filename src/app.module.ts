import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SyllabusModule } from './modules/syllabus/syllabus.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { TestsModule } from './modules/tests/tests.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AdminModule } from './modules/admin/admin.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { BooksModule } from './modules/books/books.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    AuthModule,
    UsersModule,
    SyllabusModule,
    LessonsModule,
    TestsModule,
    ProgressModule,
    AdminModule,
    LeaderboardModule,
    BooksModule,
    QuizzesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
