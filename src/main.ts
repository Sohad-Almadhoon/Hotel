import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Room Booking Management API')
    .setDescription(
      'A comprehensive backend system for managing room bookings with role-based access control',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Rooms', 'Room management endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Admin', 'Admin dashboard endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Room Booking API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════════════════╗
║   Room Booking Management API Server (NestJS)         ║
╠════════════════════════════════════════════════════════╣
║   Status: Running                                      ║
║   Port: ${port}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                        ║
║   API Documentation: http://localhost:${port}/api-docs   ║
║   Health Check: http://localhost:${port}/health          ║
╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
