import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUrl, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'O‘tkan kunlar', description: 'Kitob nomi' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Abdulla Qodiriy', description: 'Kitob muallifi' })
  @IsString()
  author: string;

  @ApiPropertyOptional({
    example: 'Ushbu asar o‘zbek romanchiligining asosi hisoblanadi.',
    description: 'Kitob haqida qisqacha ma’lumot',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
    description: 'Kitob muqovasi rasmi URL manzili',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    example: 'Adabiyot',
    description: 'Kitob kategoriyasi',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '10-sinf', description: 'Sinf' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    example: 'https://example.com/book.pdf',
    description: 'PDF fayl URL manzili',
  })
  @IsString()
  pdfUrl: string;

  @ApiProperty({
    example: 'https://example.com/audio.mp3',
    description: 'Audio fayl URL manzili',
  })
  @IsString()
  audioUrl: string;

  @ApiPropertyOptional({
    example: 3600,
    description: 'Audio davomiyligi (soniyada)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}
