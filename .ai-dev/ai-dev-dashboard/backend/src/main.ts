import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('AI Dev Dashboard API')
    .setDescription(
      'REST API for the AI Dev Dashboard — epics, stories, bugs, sprints, bursts, progress, and document management',
    )
    .setVersion('1.6.0')
    .addTag('epics', 'Epic management endpoints')
    .addTag('stories', 'Story management endpoints')
    .addTag('bugs', 'Bug tracking endpoints')
    .addTag('sprints', 'Sprint planning endpoints')
    .addTag('bursts', 'Burst session endpoints')
    .addTag('progress', 'Progress tracking endpoints')
    .addTag('documents', 'Documentation viewer endpoints')
    .addTag('cli', 'CLI execution endpoints')
    .addTag('board', 'Board data endpoints (legacy)')
    .addTag('health', 'Health check')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`🚀 AI Dev Dashboard API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/swagger`);
}

bootstrap();
