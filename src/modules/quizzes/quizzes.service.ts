import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { SaveQuizDto } from './dto/save-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<QuizDocument>) {}

  async saveQuiz(dto: SaveQuizDto) {
    const { bookId, questions } = dto;

    return this.quizModel.findOneAndUpdate(
      { bookId },
      { questions },
      { upsert: true, new: true },
    );
  }

  async getQuizByBook(bookId: string) {
    const quiz = await this.quizModel.findOne({ bookId }).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this book');
    }
    return quiz;
  }

  async getAllQuizzes() {
    return this.quizModel.find().exec();
  }
}
