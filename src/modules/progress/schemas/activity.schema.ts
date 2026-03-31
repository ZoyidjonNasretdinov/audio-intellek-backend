import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  duration: number; 

  @Prop({ required: true })
  date: string; 
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

ActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
