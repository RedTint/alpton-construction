"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    app.enableCors({
        origin: [frontendUrl, 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AI Dev Dashboard API')
        .setDescription('REST API for the AI Dev Dashboard — epics, stories, bugs, sprints, bursts, progress, and document management')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/swagger', app, document);
    const port = process.env.PORT ?? 3002;
    await app.listen(port);
    console.log(`🚀 AI Dev Dashboard API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api/swagger`);
}
bootstrap();
//# sourceMappingURL=main.js.map