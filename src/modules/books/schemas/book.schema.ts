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

  @Prop()
  category: string;

  @Prop()
  grade: string;

  @Prop({ required: true })
  pdfUrl: string;

  @Prop({ required: true })
  audioUrl: string;

  @Prop({ default: 0 })
  duration: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
