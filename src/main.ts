// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ─────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Global validation pipe ───────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties from DTOs
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,          // Auto-transform plain objects to DTO class instances
      transformOptions: {
        enableImplicitConversion: true, // Coerce query string numbers/booleans
      },
    }),
  );

  // ─── Global exception filter ──────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Swagger / OpenAPI ────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('CivicVoice API')
    .setDescription(
      `
## Overview
CivicVoice is a daily civic polling platform. One poll is active at a time, citizens
vote anonymously, and admins manage the full poll lifecycle through this API.

## Authentication
Admin endpoints require a **Bearer JWT** token obtained from \`POST /api/v1/auth/login\`.
Paste the token into the **Authorize** button (🔒) above.

## Anonymous voting
No sign-up is required to vote. The server generates a **SHA-256 voter token** from
\`pollId + clientIP + User-Agent\` to prevent duplicate votes while remaining GDPR-friendly
(no raw IP is ever stored).

## Poll lifecycle
\`\`\`
DRAFT  ──[publish]──▶  ACTIVE  ──[close / cron]──▶  CLOSED
\`\`\`
- **DRAFT** – created by admin, not visible to the public.
- **ACTIVE** – one poll at a time; accepting votes; shown on the public page.
- **CLOSED** – voting ended; results are publicly readable.

## Cron job
A background job runs **every minute** and automatically transitions any ACTIVE poll
whose \`closesAt\` datetime has passed to CLOSED.
      `.trim(),
    )
    .setVersion('1.0')
    .setContact('CivicVoice Team', '', 'admin@civicvoice.com')
    .addServer('http://localhost:3000', 'Local development')
    .addServer('https://api.civicvoice.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter the JWT token obtained from POST /api/v1/auth/login',
        in: 'header',
      },
      'JWT', // This name must match @ApiBearerAuth('JWT') on controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,       // Keep the token across page refreshes
      displayRequestDuration: true,     // Show how long each request took
      docExpansion: 'list',             // Collapse all by default
      filter: true,                     // Show tag filter box
      showExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 2,
    },
    customSiteTitle: 'CivicVoice API Docs',
    customfavIcon: 'https://nestjs.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1d23; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
  });

  // ─── Start listening ──────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀  CivicVoice API running at: http://localhost:${port}/api/v1`);
  console.log(`📖  Swagger docs available at: http://localhost:${port}/api/docs\n`);
}

bootstrap();
