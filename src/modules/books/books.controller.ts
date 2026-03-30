import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi kitob yaratish' })
  @ApiResponse({ status: 201, description: 'Kitob muvaffaqiyatli yaratildi.' })
  @ApiResponse({ status: 400, description: 'Yomon so‘rov.' })
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Barcha kitoblarni olish yoki filtrlash' })
  @ApiQuery({ name: 'category', required: false, example: 'Adabiyot' })
  @ApiQuery({ name: 'grade', required: false, example: '10-sinf' })
  @ApiQuery({ name: 'search', required: false, example: 'Sardor' })
  @ApiResponse({ status: 200, description: 'Kitoblar ro‘yxati.' })
  findAll(
    @Query('category') category?: string,
    @Query('grade') grade?: string,
    @Query('search') search?: string,
  ) {
    return this.booksService.findAll(category, grade, search);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Barcha kategoriyalarni olish' })
  @ApiResponse({ status: 200, description: 'Kategoriyalar ro‘yxati.' })
  getCategories() {
    return this.booksService.findAllCategories();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Bitta kitobni ID orqali olish' })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Kitob ma’lumotlari.' })
  @ApiResponse({ status: 404, description: 'Kitob topilmadi.' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kitob ma’lumotlarini yangilash' })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Kitob muvaffaqiyatli yangilandi.' })
  @ApiResponse({ status: 404, description: 'Kitob topilmadi.' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kitobni o‘chirish' })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Kitob muvaffaqiyatli o‘chirildi.' })
  @ApiResponse({ status: 404, description: 'Kitob topilmadi.' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Public()
  @Get(':id/stream')
  @ApiOperation({ summary: 'Kitob audio faylini stream qilish' })
  async streamAudio(
    @Param('id') id: string,
    @Res() res: Response,
    @Headers('range') range?: string,
  ) {
    return this.booksService.streamAudio(id, res, range);
  }
}
