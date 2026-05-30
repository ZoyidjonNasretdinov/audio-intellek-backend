import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      cloudinary.config({
        url: cloudinaryUrl
      });
    } else {
      // Fallback xavfsizlik uchun to'g'ridan to'g'ri berish
      cloudinary.config({
        cloud_name: 'duqptnkpo',
        api_key: '674534642839675',
        api_secret: 'zpmb1nVcDP3QB--zujqho61SZDM',
      });
    }
  }

  async uploadFile(file: Express.Multer.File, resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'audio-intellect',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new BadRequestException('Faylni yuklashda xatolik yuz berdi'));
          }
          if (!result) {
             return reject(new BadRequestException("Faylni yuklashda noma'lum xatolik"));
          }
          resolve({ url: result.secure_url });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
