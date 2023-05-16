import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SocketIOAdapter } from './adapter/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }),);

//  const socketIOAdapter = new SocketIOAdapter(app)
//
//  app.useWebSocketAdapter(socketIOAdapter)
//
  await app.listen(3500);
}
bootstrap();
