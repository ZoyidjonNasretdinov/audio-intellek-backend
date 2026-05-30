import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SaveQuizDto } from './dto/save-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, AdminGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async saveQuiz(@Body() dto: SaveQuizDto) {
    return this.quizzesService.saveQuiz(dto);
  }

  @Public()
  @Get()
  async getAllQuizzes() {
    return this.quizzesService.getAllQuizzes();
  }

  @Public()
  @Get('book/:bookId')
  async getQuizByBook(@Param('bookId') bookId: string) {
    return this.quizzesService.getQuizByBook(bookId);
  }
}
