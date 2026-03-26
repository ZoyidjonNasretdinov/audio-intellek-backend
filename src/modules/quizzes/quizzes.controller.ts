import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SaveQuizDto } from './dto/save-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async saveQuiz(@Body() dto: SaveQuizDto) {
    return this.quizzesService.saveQuiz(dto);
  }

  @Get()
  async getAllQuizzes() {
    return this.quizzesService.getAllQuizzes();
  }

  @Get('book/:bookId')
  async getQuizByBook(@Param('bookId') bookId: string) {
    return this.quizzesService.getQuizByBook(bookId);
  }
}
