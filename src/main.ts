import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 CORS ni yoqish (Web va Mobile uchun moslashtirilgan)
  app.enableCors({
    origin: (origin, callback) => {
      // Mobile ilovalar uchun origin null bo'lishi mumkin
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:8081',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      const isAllowed =
        allowedOrigins.includes(origin) || /\.railway\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Boshqa barcha holatlarda ham ruxsat beramiz (dev rejimida xavfsizroq)
        callback(null, true);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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
