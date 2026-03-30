import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('api/health')
  getHealth(): string {
    return 'OK';
  }

  @Public()
  @Get('swagger')
  getSwagger(@Res() res: Response) {
    return res.redirect('/docs');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
