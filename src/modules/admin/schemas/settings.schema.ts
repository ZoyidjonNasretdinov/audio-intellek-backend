import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ default: 'Audio Intellect' })
  appName: string;

  @Prop({ default: 'Bilim olishning eng qulay usuli' })
  appDescription: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ default: 50 })
  maxBooksPerUser: number;

  @Prop({ default: 'uz' })
  defaultLanguage: string;

  @Prop({ default: '' })
  contactPhone: string;

  @Prop({ default: '' })
  contactEmail: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
