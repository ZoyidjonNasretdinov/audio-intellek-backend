
import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty({ example: '699d52847458e735dd42b68a', description: 'User ID' })
  _id: string;

  @ApiProperty({ example: '+998700134501', description: 'User phone number' })
  phone: string;

  @ApiProperty({ example: 'USER', description: 'User role' })
  role: string;

}
