import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://194.5.79.68', // ваш текущий адрес (без порта 3000)
      'http://194.5.79.68:3000', // если фронт на порту 3000
      'http://localhost:3000', // для локальной разработки
      'http://localhost', // localhost без порта
      'http://194.5.79.68:80', // явно указать порт 80
    ],
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
