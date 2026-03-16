import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '+998700134501',
    description: 'Telefon raqam kiritiladi',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: '12345678',
    description: 'Userning passwordini kiritiladi',
  })
  @IsString()
  password: string;
}
