import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Use require for express to ensure compatibility with Vercel serverless functions
const express = require('express');

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

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('SHOPLUX API')
      .setDescription('E-commerce platform API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Configure Swagger to use CDN for static assets (required for Vercel serverless)
    // Create custom HTML template that uses CDN
    const customSwaggerHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>SHOPLUX API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    .swagger-ui .topbar { display: none }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: window.location.origin + '/api/docs-json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true
      });
    };
  </script>
</body>
</html>
    `;
    
    // Setup Swagger - this creates the /api/docs-json endpoint
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'SHOPLUX API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      customJs: [],
    });
    
    // Override the Swagger HTML route AFTER setup to use our custom template with CDN
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/api/docs', (req: any, res: any) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(customSwaggerHtml);
    });

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

