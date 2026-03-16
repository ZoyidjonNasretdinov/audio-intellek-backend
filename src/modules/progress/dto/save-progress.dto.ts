import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveProgressDto {
  @ApiProperty({ example: '699d9d232d3d59327b6d4877' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '65f1234567890abcdef' })
  @IsString()
  bookId: string;

  @ApiProperty({ example: 320 })
  @IsNumber()
  currentTime: number;

  @ApiProperty({ example: 1800 })
  @IsNumber()
  duration: number;
}
