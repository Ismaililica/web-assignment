// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Frontend (Vite) dev origin'ine izin ver
 app.enableCors({
  origin: [
    'http://localhost:5173', // vite dev
    'http://localhost:4173', // vite preview
    // canlıya atarsan Vercel domainini de buraya ekle:
    // 'https://<senin-proje-adın>.vercel.app'
  ],
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
});


  // Body validation (DTO'lar için)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // DTO'da olmayan alanları at
      forbidNonWhitelisted: true,// DTO dışı alan gelirse 400 ver
      transform: true,           // @Param/@Query sayı vs. tip dönüşümü
    }),
  );

  // Tüm endpointleri /api altına al
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Backend running at http://localhost:3000');
}
bootstrap();
