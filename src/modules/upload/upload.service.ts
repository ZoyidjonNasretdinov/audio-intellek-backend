import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL') || '';
    if (cloudinaryUrl) {
      // url format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        cloudinary.config({
          api_key: match[1],
          api_secret: match[2],
          cloud_name: match[3],
        });
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'adabiyot', resource_type: resourceType },
        (error, result) => {
          if (error || !result) return reject(new BadRequestException('Fayl yuklashda xatolik: ' + (error?.message || 'Noma\'lum xato')));
          resolve({ url: result.secure_url });
        },
      );
      
      uploadStream.end(file.buffer);
    });
  }
}
