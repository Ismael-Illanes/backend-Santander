// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1); // Salir con código de error
});
