import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3000;

  async function bootstrap() {
    await app.listen(port, "0.0.0.0");
  }
}
bootstrap();
