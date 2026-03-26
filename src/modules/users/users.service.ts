import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).select('+password +refreshToken');
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIds(ids: string[]) {
    return this.userModel
      .find({ _id: { $in: ids } })
      .select('-password -refreshToken')
      .lean()
      .exec();
  }

  async findAll() {
    return this.userModel.find().select('-password -refreshToken').lean();
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      refreshToken,
    });
  }
}
