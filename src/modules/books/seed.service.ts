import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';
import { Quiz, QuizDocument } from '../quizzes/schemas/quiz.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {}

  async onModuleInit() {
    const bookCount = await this.bookModel.countDocuments();
    if (bookCount === 0) {
      console.log('Seeding demo data...');
      await this.seed();
    }
  }

  async seed() {
    const demoBooks = [
      {
        title: "O'tkan kunlar",
        author: 'Abdulla Qodiriy',
        description:
          "O'zbek adabiyotining ilk romani. Kumush va Otabekning fojiali muhabbati haqida.",
        category: "O'zbek Adabiyoti",
        grade: '9 - sinf',
        coverImage: 'https://kitobxon.com/img_knigi/74.jpg',
        pdfUrl: 'https://example.com/otkan-kunlar.pdf',
        audioUrl: 'https://example.com/otkan-kunlar.mp3',
        duration: 3600,
      },
      {
        title: 'Sariq devni minib',
        author: "Xudoyberdi To'xtaboyev",
        description: 'Hoshimjonning sarguzashtlari haqida qiziqarli hikoya.',
        category: 'Sarguzasht',
        grade: '5 - sinf',
        coverImage: 'https://kitobxon.com/img_knigi/414.jpg',
        pdfUrl: 'https://example.com/sariq-dev.pdf',
        audioUrl: 'https://example.com/sariq-dev.mp3',
        duration: 2400,
      },
      {
        title: 'Sherlok Xolms sarguzashtlari',
        author: 'Artur Konan Doyl',
        description:
          'Dunyoga mashhur detektiv Sherlok Xolms va doktor Vatsonning sarguzashtlari.',
        category: 'Detektiv',
        grade: '10 - sinf',
        coverImage: 'https://kitobxon.com/img_knigi/2068.jpg',
        pdfUrl: 'https://example.com/sherlock.pdf',
        audioUrl: 'https://example.com/sherlock.mp3',
        duration: 4800,
      },
      {
        title: 'Mehrobdan chayon',
        author: 'Abdulla Qodiriy',
        description:
          "Toshkent va Qo'qon xonligidagi tarixiy voqealar asosida yozilgan roman.",
        category: "O'zbek Adabiyoti",
        grade: '11 - sinf',
        coverImage: 'https://kitobxon.com/img_knigi/75.jpg',
        pdfUrl: 'https://example.com/mehrobdan-chayon.pdf',
        audioUrl: 'https://example.com/mehrobdan-chayon.mp3',
        duration: 4200,
      },
    ];

    for (const bookData of demoBooks) {
      const book = await this.bookModel.create(bookData);

      // Create a quiz for each book
      await this.quizModel.create({
        bookId: String(book._id),
        questions: [
          {
            question: `${book.title} asarining muallifi kim?`,
            options: [book.author, 'Oybek', 'Hamid Olimjon', "G'afur G'ulom"],
            correctAnswerIndex: 0,
          },
          {
            question: `Ushbu asar qaysi janrga oid?`,
            options: ['Roman', 'Hikoya', 'Doston', 'Drama'],
            correctAnswerIndex: book.category === 'Sarguzasht' ? 1 : 0,
          },
          {
            question: 'Asar sizga yoqdimi?',
            options: ['Ha', "Yo'q", "O'rtacha", "Hali o'qimadim"],
            correctAnswerIndex: 0,
          },
        ],
      });
    }
    console.log('Seeding completed.');
  }
}
