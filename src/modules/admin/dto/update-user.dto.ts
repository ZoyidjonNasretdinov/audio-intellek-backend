import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'Sardor Karimov' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '10-sinf' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ example: 'ADMIN', enum: ['USER', 'ADMIN'] })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: string;
}
