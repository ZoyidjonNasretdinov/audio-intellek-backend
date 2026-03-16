import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }
  
  // 🔥 FIX SHU YERDA
  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).select('+password +refreshToken');
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      refreshToken,
    });
  }
}
