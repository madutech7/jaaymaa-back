import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter);
  
  // Enable CORS - Update with your Netlify frontend URL
  const frontendUrl = process.env.FRONTEND_URL || 'https://your-netlify-app.netlify.app';
  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:4200',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  await app.init();
  cachedApp = expressApp;
  
  return expressApp;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app(req, res);
}

