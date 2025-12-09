import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


    // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Wallet Service API')
    .setDescription('API depositing, sending and receing money within a wallet')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt', // name of the scheme
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'apiKey', // name of the scheme
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.APP_PORT ?? 3001);


  console.log(`🚀 Application is running on: http://localhost:${process.env.APP_PORT}`);
  console.log(`📖 Swagger docs available at: http://localhost:${process.env.APP_PORT}/api`);
}
bootstrap();
