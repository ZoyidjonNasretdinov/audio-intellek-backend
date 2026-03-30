import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 CORS ni yoqish (Eng keng qamrovli usul)
  app.enableCors({
    origin: (origin, callback) => {
      // Barcha kelayotgan origin'larga ruxsat beramiz
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
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

  await app.listen(3000);
}
bootstrap();
