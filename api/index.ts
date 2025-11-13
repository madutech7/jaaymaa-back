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

  try {
    console.log('🚀 Initializing NestJS application...');
    console.log('📦 Environment variables check:');
    console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');

    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Enable CORS - Update with your Netlify frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://jaaymaa-app.netlify.app';
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
    
    console.log('✅ NestJS application initialized successfully');
    return expressApp;
  } catch (error) {
    console.error('❌ Error initializing NestJS application:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error: any) {
    console.error('❌ Handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
}

