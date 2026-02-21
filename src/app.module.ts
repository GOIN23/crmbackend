import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractsController } from './parsing/contracts.controller';
import { ZakupkiUnilateralRefusalService } from './parsing/application/zakupki.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        console.log(redisUrl);
        const redisStore = new KeyvRedis(redisUrl);

        // Проверяем подключение к Redis
        try {
          // Создаем временный Keyv с Redis store для проверки
          const testKeyv = new Keyv({ store: redisStore });
          await testKeyv.set('health-check', 'ok', 60000);
          const result = await testKeyv.get('health-check');

          if (result === 'ok') {
            console.log('[CACHE] Redis подключен успешно ✓');

            // Возвращаем конфигурацию с обоими stores (Redis как основной, in-memory как fallback)
            return {
              stores: [
                // Redis store (основной)
                new Keyv({ store: redisStore }),
                // In-memory store (резервный)
                new Keyv({
                  store: new CacheableMemory({
                    ttl: 180000, // 3 минуты в миллисекундах
                    lruSize: 5000,
                  }),
                }),
              ],
              ttl: 180000,
              max: 5000,
              isGlobal: true,
            };
          } else {
            console.warn(
              '[CACHE] Redis тест не прошел, использую только in-memory',
            );
          }
        } catch (error) {
          console.error('[CACHE] Ошибка подключения к Redis:', error.message);
          console.warn('[CACHE] Использую только in-memory хранилище');
        }

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: 180000,
                lruSize: 5000,
              }),
            }),
          ],
          ttl: 180000,
          max: 5000,
          isGlobal: true,
        };
      },
    }),
  ],
  controllers: [AppController, ContractsController],
  providers: [AppService, ZakupkiUnilateralRefusalService, PrismaService],
})
export class AppModule {}
