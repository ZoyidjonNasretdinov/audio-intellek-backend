import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Book, BookSchema } from '../books/schemas/book.schema';
import { Progress, ProgressSchema } from '../progress/schemas/progress.schema';
import { Activity, ActivitySchema } from '../progress/schemas/activity.schema';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { Category, CategorySchema } from './schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Book.name, schema: BookSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
