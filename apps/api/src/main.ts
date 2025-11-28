import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

/**
 * Bootstrap aplikasi NestJS
 *
 * Konfigurasi:
 * - CORS dengan environment-based origins
 * - Helmet untuk security headers
 * - Compression untuk performance
 * - Global validation pipes
 * - Rate limiting (configured in AppModule)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Helmet untuk security headers
  // Melindungi aplikasi dari common vulnerabilities
  app.use(helmet());

  // Enable Compression untuk response size optimization
  // Mengurangi bandwidth dan meningkatkan response time
  app.use(compression());

  // Enable CORS dengan environment-based configuration
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Enable validation dengan whitelist untuk strip unknown properties
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
