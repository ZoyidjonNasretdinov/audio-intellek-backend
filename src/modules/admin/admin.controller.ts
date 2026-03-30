import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateBookDto } from '../books/dto/create-book.dto';
import { UpdateBookDto } from '../books/dto/update-book.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Public()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- DASHBOARD ---

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard statistikasi',
    description:
      'Umumiy users soni, mashhur kitoblar, oylik chart, kategoriyalar',
  })
  @ApiResponse({ status: 200, description: "Dashboard ma'lumotlari" })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // --- USERS ---

  @Get('users')
  @ApiOperation({
    summary: 'Barcha foydalanuvchilar (pagination + search + role filter)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'Sardor' })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN'] })
  @ApiResponse({ status: 200, description: "Foydalanuvchilar ro'yxati" })
  getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search, role);
  }

  @Get('users/:id')
  @ApiOperation({ summary: "Foydalanuvchi ma'lumotlari" })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi' })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Get('users/:id/stats')
  @ApiOperation({
    summary: 'Foydalanuvchi statistikasi (tinglash tarixi, faollik)',
  })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi statistikasi' })
  getUserStats(@Param('id') id: string) {
    return this.adminService.getUserStats(id);
  }

  @Patch('users/:id')
  @ApiOperation({
    summary: 'Foydalanuvchini yangilash (ism, telefon, sinf, rol)',
  })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Yangilandi' })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({
    summary: "Foydalanuvchini o'chirish (progress va activity bilan)",
  })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: "O'chirildi" })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // --- CONTENT (BOOKS) ---

  @Get('books')
  @ApiOperation({
    summary: 'Barcha kitoblar (pagination + search + category + grade)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'Abdulla Qodiriy' })
  @ApiQuery({ name: 'category', required: false, example: 'Adabiyot' })
  @ApiQuery({ name: 'grade', required: false, example: '10-sinf' })
  @ApiResponse({ status: 200, description: "Kitoblar ro'yxati" })
  getAllBooks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('grade') grade?: string,
  ) {
    return this.adminService.getAllBooks(page, limit, search, category, grade);
  }

  @Get('books/:id')
  @ApiOperation({ summary: "Bitta kitob ma'lumotlari" })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Kitob' })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  getBookById(@Param('id') id: string) {
    return this.adminService.getBookById(id);
  }

  @Get('books/:id/stats')
  @ApiOperation({ summary: 'Kitob tinglash statistikasi' })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Kitob statistikasi' })
  getBookStats(@Param('id') id: string) {
    return this.adminService.getBookStats(id);
  }

  @Post('books')
  @ApiOperation({ summary: 'Yangi kitob qoshish' })
  @ApiResponse({ status: 201, description: 'Kitob yaratildi' })
  createBook(@Body() dto: CreateBookDto) {
    return this.adminService.createBook(dto);
  }

  @Patch('books/:id')
  @ApiOperation({ summary: 'Kitobni yangilash' })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Yangilandi' })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.adminService.updateBook(id, dto);
  }

  @Delete('books/:id')
  @ApiOperation({ summary: "Kitobni o'chirish (progress ham o'chiriladi)" })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: "O'chirildi" })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  deleteBook(@Param('id') id: string) {
    return this.adminService.deleteBook(id);
  }

  // --- ANALYTICS ---

  @Get('analytics')
  @ApiOperation({
    summary: 'Analitika - kunlik faollik, top kitoblar, top foydalanuvchilar',
    description: 'period: week | month | year',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'year'],
    example: 'month',
  })
  @ApiResponse({ status: 200, description: "Analitika ma'lumotlari" })
  getAnalytics(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    return this.adminService.getAnalytics(period);
  }

  // --- SETTINGS ---

  @Get('settings')
  @ApiOperation({ summary: 'Ilova sozlamalarini olish' })
  @ApiResponse({ status: 200, description: 'Sozlamalar' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Ilova sozlamalarini yangilash' })
  @ApiResponse({ status: 200, description: 'Yangilandi' })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.adminService.updateSettings(dto);
  }

  @Post('seed')
  @ApiOperation({ summary: "Demo ma'lumotlar bilan to'ldirish" })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli yuklandi' })
  seedDemoData() {
    return this.adminService.seedDemoData();
  }

  @Post('fix-genders')
  @ApiOperation({ summary: 'Mavjud foydalanuvchilarga jins biriktirish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli yangilandi' })
  fixGenders() {
    return this.adminService.fixGenders();
  }

  // --- CATEGORIES ---

  @Get('categories')
  @ApiOperation({ summary: 'Barcha kategoriyalarni olish' })
  @ApiResponse({ status: 200, description: "Kategoriyalar ro'yxati" })
  getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: "Yangi kategoriya qo'shish" })
  @ApiResponse({ status: 201, description: 'Yaratildi' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Kategoriyani tahrirlash' })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: 'Yangilandi' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: "Kategoriyani o'chirish" })
  @ApiParam({ name: 'id', example: '65f1234567890abcdef12345' })
  @ApiResponse({ status: 200, description: "O'chirildi" })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}
