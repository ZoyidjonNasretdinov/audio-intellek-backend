import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Zoyidjon Nasretdinov',
    description: 'Foydalanuvchi ismi va Familyasi',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '+998700134501',
    description: 'Telefon raqam kiritiladi',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: '12345678',
    description: "8 tagacha bo'gan password kiritiladi",
  })
  @MinLength(8)
  password: string;

}
