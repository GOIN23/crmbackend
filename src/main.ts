import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);
  await app.listen(3001);
}
bootstrap();
