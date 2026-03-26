import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema({ _id: false })
class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctAnswerIndex: number;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true, unique: true })
  bookId: string;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
