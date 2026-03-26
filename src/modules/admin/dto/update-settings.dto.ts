import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Audio Intellect' })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({ example: 'Bilim olishning eng qulay usuli' })
  @IsOptional()
  @IsString()
  appDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  maxBooksPerUser?: number;

  @ApiPropertyOptional({ example: 'uz' })
  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @ApiPropertyOptional({ example: '+998712345678' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'info@audiointellect.uz' })
  @IsOptional()
  @IsString()
  contactEmail?: string;
}
