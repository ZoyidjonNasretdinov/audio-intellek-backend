import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  duration: number; // Daily duration in seconds

  @Prop({ required: true })
  date: string; // YYYY-MM-DD
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Ensure unique combination of userId and date
ActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
