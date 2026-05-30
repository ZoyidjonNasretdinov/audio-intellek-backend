import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ default: "Noma'lum" })
  grade: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop({ default: 'USER' })
  role: string;

  @Prop({ default: 'Erkak' })
  gender: string;

  @Prop()
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
