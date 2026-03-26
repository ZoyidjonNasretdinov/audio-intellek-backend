import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  currentTime: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ default: 0 })
  quizScore: number;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

ProgressSchema.index({ userId: 1 });
ProgressSchema.index({ bookId: 1 });
ProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });
