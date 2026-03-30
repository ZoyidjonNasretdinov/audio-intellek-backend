import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 CORS sozlamalari (Vercel va boshqa front-endlar uchun)
  app.enableCors({
    origin: true, // Barcha originlarga ruxsat beradi (credentials: true bilan mos keladi)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-HTTP-Method-Override',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  // Debug uchun logger (Railway logs'da ko'rinadi)
  app.use((req, res, next) => {
    if (req.header('Origin')) {
      console.log(
        `[CORS Request] Origin: ${req.header('Origin')}, Method: ${req.method}, Path: ${req.path}`,
      );
    }
    next();
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Adabiyot API')
    .setDescription('Adabiyot o‘quv platformasi backend hujjatlari')
    .setVersion('1.0')
    .addBearerAuth() // JWT uchun
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
