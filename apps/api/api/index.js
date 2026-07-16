const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { ValidationPipe } = require('@nestjs/common');
const helmet = require('helmet');
const compression = require('compression');
const express = require('express');

const server = express();
let initialized = false;

async function bootstrap() {
  if (initialized) return;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.use(helmet());
  app.use(compression());
  const origins = (process.env.CORS_ORIGINS && process.env.CORS_ORIGINS.split(',')) || ['http://localhost:3000'];
  app.enableCors({ origin: origins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  initialized = true;
}

module.exports = async (req, res) => {
  try {
    await bootstrap();
    server(req, res);
  } catch (err) {
    console.error('[Vercel Handler Error]', err);
    res.status(500).json({ error: err.message, stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined });
  }
};
