import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const isDesktopMode = process.env.DESKTOP_MODE === 'true';
  
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow multiple origins for development
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation (disable in desktop mode for production builds)
  if (process.env.NODE_ENV !== 'production' || isDesktopMode) {
    const config = new DocumentBuilder()
      .setTitle('Cafe POS API')
      .setDescription('Modern Point of Sale System API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  if (isDesktopMode) {
    console.log(`🖥️  Desktop Mode: ENABLED`);
    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📦 MongoDB: mongodb://127.0.0.1:27017/cafe_pos`);
  } else {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
