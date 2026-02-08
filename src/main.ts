import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AiModule } from './modules/ai/ai.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('AI API')
    .setDescription('AI module API documentation')
    .setVersion('1.0')
    .addTag('ai')
    .addServer('http://localhost:3333')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: [AiModule],
  });

  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: 'api-docs/swagger.json',
    yamlDocumentUrl: 'api-docs/swagger.yaml',
  });

  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
}
bootstrap();
