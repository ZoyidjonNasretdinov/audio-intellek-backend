import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { CreateBookDto } from './src/modules/books/dto/create-book.dto';

async function test() {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const payload = {
    title: "",
    author: "",
    description: "",
    category: "",
    grade: ["5 - sinf"],
    audioUrl: "",
    pdfUrl: "",
    coverImage: "",
    duration: 0
  };

  try {
    const result = await pipe.transform(payload, { type: 'body', metatype: CreateBookDto });
    console.log('Passed:', result);
  } catch (err) {
    console.log('Failed:', JSON.stringify(err.response, null, 2));
  }
}

test();
