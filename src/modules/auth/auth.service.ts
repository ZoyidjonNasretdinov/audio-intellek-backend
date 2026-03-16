import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  role: string;
}

interface User {
  _id: string;
  phone: string;
  password: string;
  role: string;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    return this.generateTokensWithUser({
      ...user,
      _id: user._id.toString(),
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhone(dto.phone);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokensWithUser({
      ...user,
      _id: user._id.toString(),
    });
  }

  // GENERATE ACCESS & REFRESH TOKENS + RETURN USER
  private async generateTokensWithUser(user: User) {
    const payload: JwtPayload = {
      sub: user._id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user._id, hashedRefresh);

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        phone: user.phone,
        role: user.role,
        // agar boshqa maydonlar kerak bo‘lsa qo‘shing
      },
    };
  }
}
