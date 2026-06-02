import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { CreateBookDto } from './src/modules/books/dto/create-book.dto';

async function test() {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const payload = {
    title: "T", author: "A", description: "", category: "", grade: [], audioUrl: "", pdfUrl: "", coverImage: "", duration: NaN
  };

  try {
    const result = await pipe.transform(payload, { type: 'body', metatype: CreateBookDto });
    console.log('Passed');
  } catch (err) {
    console.log('Failed:', JSON.stringify(err.response, null, 2));
  }
}

test();
