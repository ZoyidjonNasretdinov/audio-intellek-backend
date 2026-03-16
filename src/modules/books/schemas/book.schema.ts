import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  description: string;

  @Prop()
  coverImage: string;

  // Category / subject (e.g. "Matematika", "Ona-tili")
  @Prop()
  category: string;

  // Grade level (e.g. "10-sinf")
  @Prop()
  grade: string;

  // Direct URL to the PDF file (cloud storage link)
  @Prop({ required: true })
  pdfUrl: string;

  // Direct URL to the audio file (cloud storage link)
  @Prop({ required: true })
  audioUrl: string;

  // Duration in seconds (total audio length)
  @Prop({ default: 0 })
  duration: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
