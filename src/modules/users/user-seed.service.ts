import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeedService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments();
    if (userCount === 0) {
      console.log('Seeding demo users...');
      await this.seed();
    }
  }

  async seed() {
    const hashedDefaultPassword = await bcrypt.hash('admin123', 10);

    const demoUsers = [
      {
        fullName: 'Ali Qodirov',
        phone: '+998901234567',
        grade: '9 - sinf',
        password: hashedDefaultPassword,
        role: 'USER',
        gender: 'Erkak',
      },
      {
        fullName: 'Zarnigor Mirzayeva',
        phone: '+998912345678',
        grade: '10 - sinf',
        password: hashedDefaultPassword,
        role: 'USER',
        gender: 'Ayol',
      },
      {
        fullName: 'Admin User',
        phone: 'admin@gmail.com',
        grade: 'Admin',
        password: hashedDefaultPassword,
        role: 'ADMIN',
        gender: 'Erkak',
      },
    ];

    for (const userData of demoUsers) {
      await this.userModel.create(userData);
    }
    console.log('User seeding completed.');
  }
}
