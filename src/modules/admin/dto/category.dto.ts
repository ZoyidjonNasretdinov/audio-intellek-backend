import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Klassika' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Tarixiy', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
