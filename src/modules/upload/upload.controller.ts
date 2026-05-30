import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Fayl yuborilmadi');
    }
    
    // Determine optimal resource type based on mimetype
    let resourceType: 'auto' | 'raw' | 'video' | 'image' = 'auto';
    if (file.mimetype === 'application/pdf') {
      resourceType = 'image'; // Cloudinary can convert/handle pdfs as images
    } else if (file.mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary processes audio as video
    }
    
    const result = await this.uploadService.uploadFile(file, resourceType);
    
    return result;
  }
}
