import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';
import { Category, CategoryDocument } from '../admin/schemas/category.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAllCategories(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  async create(dto: CreateBookDto): Promise<BookDocument> {
    const book = new this.bookModel(dto);
    return book.save();
  }

  async findAll(
    category?: string,
    grade?: string,
    search?: string,
  ): Promise<BookDocument[]> {
    const filter: any = {};
    if (category) filter.category = category;
    if (grade) filter.grade = grade;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    return this.bookModel.find(filter).exec();
  }

  async findOne(id: string): Promise<BookDocument> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) throw new NotFoundException(`Book with id "${id}" not found`);
    return book;
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookDocument> {
    const book = await this.bookModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!book) throw new NotFoundException(`Book with id "${id}" not found`);
    return book;
  }

  async remove(id: string): Promise<{ message: string }> {
    const book = await this.bookModel.findByIdAndDelete(id).exec();
    if (!book) throw new NotFoundException(`Book with id "${id}" not found`);
    return { message: `Book "${book.title}" deleted successfully` };
  }

  async streamAudio(id: string, res: any, range?: string) {
    try {
      const book = await this.findOne(id);
      const url = book.audioUrl;

      if (!url) {
        throw new NotFoundException('Audio URL not found for this book');
      }

      let fileId = '';
      if (url && url.includes('drive.google.com')) {
        const fileIdMatch = url.match(/(?:id=|\/d\/|open\?id=)([-\w]{25,})/);
        if (fileIdMatch) fileId = fileIdMatch[1];
      }

      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      };
      if (range) headers['Range'] = range;

      if (url.startsWith('/uploads/')) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', url);
        
        if (!fs.existsSync(filePath)) {
          throw new NotFoundException('Fayl topilmadi');
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;
          const file = fs.createReadStream(filePath, {start, end});
          
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'audio/mpeg',
          });
          return file.pipe(res);
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
          });
          return fs.createReadStream(filePath).pipe(res);
        }
      }

      if (!fileId) {
        
        const response = await axios.get(url, {
          responseType: 'stream',
          headers,
          validateStatus: () => true,
        });
        return this.pipeAxiosResponse(response, res);
      }

      const initialUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      console.log(`[Stream] Requesting: ${initialUrl}`);
      let response = await axios.get(initialUrl, {
        headers,
        validateStatus: () => true,
        maxRedirects: 5,
        responseType: 'stream',
      });

      const contentType = (
        response.headers['content-type'] || ''
      ).toLowerCase();
      console.log(
        `[Stream] Initial Status: ${response.status}, Content-Type: ${contentType}`,
      );

      if (contentType.includes('text/html')) {
        
        let html = '';
        for await (const chunk of response.data) {
          html += chunk.toString();
          if (html.length > 10000) break;
        }
        console.log(
          `[Stream] Scan warning detected. HTML length: ${html.length}`,
        );

        const confirmMatch =
          html.match(/confirm=([a-zA-Z0-9_\-]+)/) ||
          html.match(/name="confirm" value="([a-zA-Z0-9_\-]+)"/);

        if (confirmMatch) {
          const confirmCode = confirmMatch[1];
          const cookies = response.headers['set-cookie'] || [];
          const uuidMatch = html.match(/name="uuid" value="([a-zA-Z0-9_\-]+)"/);

          let downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}&confirm=${confirmCode}`;
          if (uuidMatch) {
            downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmCode}&uuid=${uuidMatch[1]}`;
          }
          console.log(
            `[Stream] Confirmation code found: ${confirmCode}. Redirecting to: ${downloadUrl}`,
          );

          const finalResponse = await axios.get(downloadUrl, {
            headers: {
              ...headers,
              Cookie: cookies.join('; '),
            },
            responseType: 'stream',
            validateStatus: () => true,
          });
          console.log(
            `[Stream] Final Status: ${finalResponse.status}, Content-Type: ${finalResponse.headers['content-type']}`,
          );

          return this.pipeAxiosResponse(finalResponse, res);
        } else {
          console.warn(
            `[Stream] HTML detected but no confirmation code found. Snip: ${html.substring(0, 200)}`,
          );
        }
      }

      if (response.status === 200 || response.status === 206) {
        return this.pipeAxiosResponse(response, res);
      }

      console.error(`[Stream] Failed to stream. Status: ${response.status}`);
      res.status(response.status).send('Unable to stream audio');
    } catch (error) {
      console.error('Streaming error:', error.message);
      if (!res.headersSent && res.status) {
        res
          .status(error.status || 500)
          .send(error.message || 'Internal Server Error');
      }
    }
  }

  private pipeAxiosResponse(response: any, res: any) {
    
    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
    ];

    headersToForward.forEach((h) => {
      if (response.headers[h]) {
        res.setHeader(h, response.headers[h]);
      }
    });

    if (!res.getHeader('accept-ranges')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }

    if (
      !res.getHeader('content-type') ||
      res.getHeader('content-type').includes('text/html')
    ) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }

    res.status(response.status);

    response.data.pipe(res);
  }
}
