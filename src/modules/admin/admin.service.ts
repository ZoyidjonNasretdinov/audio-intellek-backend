import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Book, BookDocument } from '../books/schemas/book.schema';
import {
  Progress,
  ProgressDocument,
} from '../progress/schemas/progress.schema';
import {
  Activity,
  ActivityDocument,
} from '../progress/schemas/activity.schema';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { AdminUpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateBookDto } from '../books/dto/create-book.dto';
import { UpdateBookDto } from '../books/dto/update-book.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async getDashboardStats() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [
        totalUsers,
        totalBooks,
        activityStats,
        recentUsers,
        popularBooks,
        categoryStats,
      ] = await Promise.all([
        this.userModel.countDocuments(),
        this.bookModel.countDocuments(),
        this.activityModel.aggregate([
          {
            $group: {
              _id: null,
              totalDuration: { $sum: '$duration' },
              count: { $sum: 1 },
            },
          },
        ]),
        this.userModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('-password -refreshToken')
          .lean(),
        this.progressModel.aggregate([
          {
            $group: {
              _id: '$bookId',
              totalListens: { $sum: 1 },
            },
          },
          { $sort: { totalListens: -1 } },
          { $limit: 5 },
        ]),
        this.bookModel.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

      const { totalDuration = 0, count: totalActivityCount = 0 } =
        activityStats[0] || {};

      const averageListeningHours =
        totalActivityCount > 0 ? totalDuration / totalActivityCount / 3600 : 0;

      const totalCatBooks = categoryStats.reduce(
        (s: number, c: any) => s + c.count,
        0,
      );
      const categoryDistribution = categoryStats.map((c: any) => ({
        name: c._id || 'Boshqa',
        count: c.count,
        percentage:
          totalCatBooks > 0 ? Math.round((c.count / totalCatBooks) * 100) : 0,
      }));

      const popularBooksEnriched = await Promise.all(
        popularBooks.map(async (pb) => {
          if (!pb._id || !isValidObjectId(pb._id)) return null;
          const book = await this.bookModel
            .findById(pb._id)
            .select('title author coverImage category')
            .lean();
          return { ...book, totalListens: pb.totalListens };
        }),
      );

      const monthlyStats = await this.getMonthlyStats();

      const genderStats = await this.userModel.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]);
      const genderDistribution = genderStats.map((g) => ({
        gender: g._id || "Noma'lum",
        count: g.count,
      }));

      return {
        summary: {
          totalUsers,
          totalBooks,
          totalListened: await this.progressModel.countDocuments(),
          averageListeningHours: Math.round(averageListeningHours * 10) / 10,
        },
        recentUsers,
        popularBooks: popularBooksEnriched.filter(Boolean),
        monthlyStats,
        categoryDistribution,
        genderDistribution,
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }

  async fixGenders() {
    const users = await this.userModel.find();
    let updatedCount = 0;

    for (const user of users) {
      const name = (user.fullName || '').trim().toLowerCase();
      let detectedGender = 'Erkak';

      if (
        name.endsWith('a') ||
        name.includes('ova') ||
        name.includes('eva') ||
        name.includes('qizi')
      ) {
        detectedGender = 'Ayol';
      }

      await this.userModel.findByIdAndUpdate(user._id, {
        gender: detectedGender,
      });
      updatedCount++;
    }

    return {
      message: `Jami ${updatedCount} foydalanuvchi jinsi ismiga qarab yangilandi`,
    };
  }

  private async getMonthlyStats() {
    const year = new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year + 1}-01-01`;

    const monthlyData = await this.activityModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $addFields: {
          month: { $toLong: { $substr: ['$date', 5, 2] } },
        },
      },
      {
        $group: {
          _id: '$month',
          totalDuration: { $sum: '$duration' },
          userIds: { $addToSet: '$userId' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const data = monthlyData.find((d) => d._id === month);
      return {
        month,
        totalDuration: data ? data.totalDuration : 0,
        users: data ? data.userIds.length : 0,
      };
    });

    return result;
  }

  async getAllUsers(
    page = 1,
    limit = 20,
    search?: string,
    role?: string,
  ): Promise<{
    data: UserDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshToken')
        .lean() as unknown as Promise<UserDocument[]>,
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken')
      .lean();
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async updateUser(id: string, dto: AdminUpdateUserDto) {
    if (dto.phone) {
      const existing = await this.userModel.findOne({
        phone: dto.phone,
        _id: { $ne: id },
      });
      if (existing)
        throw new BadRequestException('Bu telefon raqam allaqachon mavjud');
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password -refreshToken');
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    
    await Promise.all([
      this.progressModel.deleteMany({ userId: id }),
      this.activityModel.deleteMany({ userId: id }),
    ]);
    return {
      message: `Foydalanuvchi "${user.fullName}" muvaffaqiyatli oʻchirildi`,
    };
  }

  async getUserStats(id: string) {
    const user = await this.getUserById(id);
    const [totalListened, totalActivity, recentActivity] = await Promise.all([
      this.progressModel.countDocuments({ userId: id }),
      this.activityModel.find({ userId: id }).lean(),
      this.activityModel
        .find({ userId: id })
        .sort({ date: -1 })
        .limit(30)
        .lean(),
    ]);

    const totalDuration = totalActivity.reduce(
      (acc, a) => acc + (a.duration || 0),
      0,
    );

    return {
      user,
      stats: {
        totalBooksListened: totalListened,
        totalListeningSeconds: totalDuration,
        totalListeningHours: Math.round((totalDuration / 3600) * 10) / 10,
        activeDays: totalActivity.length,
      },
      recentActivity,
    };
  }

  async getAllBooks(
    page = 1,
    limit = 20,
    search?: string,
    category?: string,
    grade?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (grade) filter.grade = grade;

    const [data, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bookModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookById(id: string) {
    const book = await this.bookModel.findById(id).lean();
    if (!book) throw new NotFoundException('Kitob topilmadi');
    return book;
  }

  async createBook(dto: CreateBookDto) {
    const book = new this.bookModel(dto);
    return book.save();
  }

  async updateBook(id: string, dto: UpdateBookDto) {
    const book = await this.bookModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!book) throw new NotFoundException('Kitob topilmadi');
    return book;
  }

  async deleteBook(id: string) {
    const book = await this.bookModel.findByIdAndDelete(id);
    if (!book) throw new NotFoundException('Kitob topilmadi');
    await this.progressModel.deleteMany({ bookId: id });
    return {
      message: `Kitob "${book.title}" muvaffaqiyatli oʻchirildi`,
    };
  }

  async getBookStats(id: string) {
    const book = await this.getBookById(id);
    const [totalListens, uniqueListeners] = await Promise.all([
      this.progressModel.countDocuments({ bookId: id }),
      this.progressModel.distinct('userId', { bookId: id }),
    ]);

    return {
      book,
      stats: {
        totalListens,
        uniqueListeners: uniqueListeners.length,
      },
    };
  }

  async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: string;

      if (period === 'week') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split('T')[0];
      } else if (period === 'month') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
      } else {
        startDate = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      }

      const todayStr = now.toISOString().split('T')[0];

      const [
        dailyActivity,
        topBooks,
        topUsers,
        gradeDistribution,
        newUsersCount,
        activeUsersCount,
      ] = await Promise.all([
        
        this.activityModel.aggregate([
          { $match: { date: { $gte: startDate, $lte: todayStr } } },
          {
            $group: {
              _id: '$date',
              totalDuration: { $sum: '$duration' },
              uniqueUsers: { $addToSet: '$userId' },
            },
          },
          {
            $project: {
              date: '$_id',
              totalDuration: 1,
              userCount: { $size: '$uniqueUsers' },
            },
          },
          { $sort: { date: 1 } },
        ]),

        this.progressModel.aggregate([
          {
            $group: {
              _id: '$bookId',
              listenCount: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
            },
          },
          { $sort: { listenCount: -1 } },
          { $limit: 10 },
        ]),

        this.activityModel.aggregate([
          { $match: { date: { $gte: startDate } } },
          {
            $group: {
              _id: '$userId',
              totalDuration: { $sum: '$duration' },
              activeDays: { $sum: 1 },
            },
          },
          { $sort: { totalDuration: -1 } },
          { $limit: 10 },
        ]),

        this.userModel.aggregate([
          { $group: { _id: '$grade', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        this.userModel.countDocuments({
          createdAt: { $gte: new Date(startDate) },
        }),

        this.activityModel.distinct('userId', {
          date: { $gte: startDate },
        }),
      ]);

      const topBooksEnriched = await Promise.all(
        topBooks.map(async (tb) => {
          if (!tb._id || !isValidObjectId(tb._id)) return null;
          const book = await this.bookModel
            .findById(tb._id)
            .select('title author category coverImage')
            .lean();
          return {
            ...book,
            listenCount: tb.listenCount,
            uniqueListeners: tb.uniqueUsers.length,
          };
        }),
      );

      const topUsersEnriched = await Promise.all(
        topUsers.map(async (tu) => {
          if (!tu._id || !isValidObjectId(tu._id)) return null;
          const user = await this.userModel
            .findById(tu._id)
            .select('fullName phone grade')
            .lean();
          return {
            ...user,
            totalDuration: tu.totalDuration,
            activeDays: tu.activeDays,
            totalHours: Math.round((tu.totalDuration / 3600) * 10) / 10,
          };
        }),
      );

      const getTopBooksByGender = async (genderValue: string) => {
        
        const genderUsers = await this.userModel
          .find({ gender: genderValue })
          .select('_id')
          .lean();
        const genderUserIds = genderUsers.map((u) => u._id.toString());

        if (genderUserIds.length === 0) return [];

        const rawBooks = await this.progressModel.aggregate([
          { $match: { userId: { $in: genderUserIds } } },
          {
            $group: {
              _id: '$bookId',
              listenCount: { $sum: 1 },
            },
          },
          { $sort: { listenCount: -1 } },
          { $limit: 5 },
        ]);

        return Promise.all(
          rawBooks.map(async (rb) => {
            if (!rb._id || !isValidObjectId(rb._id)) return null;
            const book = await this.bookModel
              .findById(rb._id)
              .select('title author coverImage category')
              .lean();
            return { ...book, listenCount: rb.listenCount };
          }),
        ).then((arr) => arr.filter(Boolean));
      };

      const [topBooksMale, topBooksFemale, genderDistribution] =
        await Promise.all([
          getTopBooksByGender('Erkak'),
          getTopBooksByGender('Ayol'),
          this.userModel.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } },
          ]),
        ]);
      
      return {
        period,
        summary: {
          newUsers: newUsersCount,
          activeUsers: activeUsersCount.length,
          totalDuration: dailyActivity.reduce(
            (acc, d) => acc + (d.totalDuration || 0),
            0,
          ),
        },
        dailyActivity,
        topBooks: topBooksEnriched.filter(Boolean),
        topBooksMale,
        topBooksFemale,
        topUsers: topUsersEnriched.filter(Boolean),
        gradeDistribution: gradeDistribution.map((g) => ({
          grade: g._id || 'Nomaʼlum',
          count: g.count,
        })),
        genderDistribution: genderDistribution.map((g) => ({
          gender: g._id || 'Nomaʼlum',
          count: g.count,
        })),
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      throw error;
    }
  }

  async getSettings(): Promise<SettingsDocument> {
    let settings = (await this.settingsModel
      .findOne()
      .lean()) as unknown as SettingsDocument;
    if (!settings) {
      settings = (await this.settingsModel.create({})) as SettingsDocument;
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<SettingsDocument> {
    const settings = await this.settingsModel.findOne();
    if (!settings) {
      return this.settingsModel.create(dto) as unknown as SettingsDocument;
    }
    Object.assign(settings, dto);
    return settings.save() as unknown as SettingsDocument;
  }

  async getAllCategories() {
    return this.categoryModel.find().sort({ name: 1 }).lean();
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]/g, '');
    const existing = await this.categoryModel.findOne({ name: dto.name });
    if (existing)
      throw new BadRequestException('Bunday kategoriya allaqachon mavjud');

    const category = new this.categoryModel({ ...dto, slug });
    return category.save();
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const update: any = { ...dto };
    if (dto.name) {
      update.slug = dto.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]/g, '');
    }
    const category = await this.categoryModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    return { message: 'Kategoriya oʻchirildi' };
  }

  async seedDemoData() {
    console.log('--- SEEDING STARTED ---');
    try {
      const names = [
        'Anvar Soliyev',
        'Dildora Olimova',
        'Jasur Hamroyev',
        'Malika Toshmatova',
        'Otabek Madaminov',
        'Nigora Joʻrayeva',
        'Sardor Qodirov',
        'Umida Rustamova',
        'Bekzod Karimov',
        'Zuhra Eshonqulova',
      ];
      const phonePrefix = '+99890';

      const users: any[] = [];
      for (let i = 0; i < names.length; i++) {
        const phone = `${phonePrefix}${1000000 + i}`;
        let user = await this.userModel.findOne({ phone }).lean();
        if (!user) {
          user = await this.userModel.create({
            fullName: names[i],
            phone,
            password: 'password123',
            grade: String((i % 11) + 1),
            gender: i % 2 === 0 ? 'Erkak' : 'Ayol',
            role: i === 0 ? 'ADMIN' : 'USER',
          });

          console.log(`User created: ${user.fullName}`);
        }
        users.push(user);
      }
      console.log(`Seeding: ${users.length} users ready.`);

      const booksData = [
        {
          title: 'Oʻtkan kunlar',
          author: 'Abdulla Qodiriy',
          category: 'Klassika',
          grade: '9',
        },
        {
          title: 'Mehrobdan chayon',
          author: 'Abdulla Qodiriy',
          category: 'Klassika',
          grade: '9',
        },
        {
          title: 'Yulduzli tunlar',
          author: 'Pirimqul Qodirov',
          category: 'Tarixiy',
          grade: '10',
        },
        {
          title: 'Kecha va kunduz',
          author: 'Choʻlpon',
          category: 'Roman',
          grade: '11',
        },
        {
          title: 'Shum bola',
          author: 'Gʻafur Gʻulom',
          category: 'Qissa',
          grade: '5',
        },
        {
          title: 'Sariq devni minib',
          author: 'Xudoyberdi Toʻxtaboyev',
          category: 'Sarguzasht',
          grade: '6',
        },
        {
          title: 'Dunyoning ishlari',
          author: 'Oʻtkir Hoshimov',
          category: 'Hikoyalar',
          grade: '7',
        },
        {
          title: 'Ufq',
          author: 'Said Ahmad',
          category: 'Trilogiya',
          grade: '11',
        },
      ];

      const books: any[] = [];
      for (const b of booksData) {
        let book = await this.bookModel.findOne({ title: b.title }).lean();
        if (!book) {
          book = await this.bookModel.create({
            ...b,
            description: `${b.title} - oʻzbek adabiyotining durdonalaridan biri.`,
            duration: 3600 + Math.random() * 7200,
            coverImage: `https://picsum.photos/seed/${encodeURIComponent(b.title)}/400/600`,
            pdfUrl: 'https://example.com/sample.pdf',
            audioUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          });
          console.log(`Book created: ${b.title}`);
        }
        books.push(book);

        const catName = b.category;
        const slug = catName
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]/g, '');
        await this.categoryModel.findOneAndUpdate(
          { name: catName },
          { name: catName, slug },
          { upsert: true, new: true },
        );
      }
      console.log(`Seeding: ${books.length} books ready.`);

      const now = new Date();
      for (const user of users) {
        const userIdStr = user._id.toString();
        const numBooks = 2 + Math.floor(Math.random() * 2);
        const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
        const selectedBooks = shuffledBooks.slice(0, numBooks);

        for (const book of selectedBooks) {
          const bookIdStr = book._id.toString();
          
          await this.progressModel.findOneAndUpdate(
            { userId: userIdStr, bookId: bookIdStr },
            {
              $setOnInsert: {
                userId: userIdStr,
                bookId: bookIdStr,
                currentTime: Math.random() * book.duration,
                duration: book.duration,
              },
            },
            { upsert: true },
          );
        }

        for (let d = 0; d < 20; d++) {
          const activityDate = new Date(now);
          activityDate.setDate(now.getDate() - Math.floor(Math.random() * 45));
          const dateStr = activityDate.toISOString().split('T')[0];

          await this.activityModel.findOneAndUpdate(
            { userId: userIdStr, date: dateStr },
            {
              $setOnInsert: {
                userId: userIdStr,
                date: dateStr,
                duration: 1800 + Math.random() * 5400, 
              },
            },
            { upsert: true },
          );
        }
      }

      console.log('--- SEEDING COMPLETED SUCCESSFULY ---');
      return {
        message: 'Demo maʼlumotlar muvaffaqiyatli yuklandi',
        usersCount: users.length,
        booksCount: books.length,
      };
    } catch (error) {
      console.error('--- SEEDING ERROR ---');
      console.error(error);
      throw error;
    }
  }
}
