import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Category, CategorySchema } from '../admin/schemas/category.schema';
import { Quiz, QuizSchema } from '../quizzes/schemas/quiz.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Quiz.name, schema: QuizSchema },
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService, SeedService],
  exports: [BooksService],
})
export class BooksModule {}
