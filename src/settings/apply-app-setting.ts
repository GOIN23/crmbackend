import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from 'src/common/http-exception-filter';
import { AppModule } from 'src/app.module';

interface CustomError {
  field: string;
  message: string;
}

// Префикс нашего приложения (http://site.com/api)
const APP_PREFIX = 'api/v1';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  // Для внедрения зависимостей в validator constraint
  // {fallbackOnErrors: true} требуется, поскольку Nest генерирует исключение,
  // когда DI не имеет необходимого класса.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
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

  app.use(cookieParser());
  // Применение глобальных Interceptors
  // app.useGlobalInterceptors()

  // Применение глобальных Guards
  //  app.useGlobalGuards(new AuthGuard());

  // Установка префикса
  setAppPrefix(app);

  // Применение глобальных pipes
  setAppPipes(app);

  // Применение глобальных exceptions filters
  setAppExceptionsFilters(app);
};

const setAppPrefix = (app: INestApplication) => {
  // Устанавливается для разворачивания front-end и back-end на одном домене
  // https://site.com - front-end
  // https://site.com/api - backend-end
  app.setGlobalPrefix(APP_PREFIX);
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    //для правильного отображения ошибок, настраиваем useGlobalPipes
    new ValidationPipe({
      // Для работы трансформации входящих данных
      transform: true,
      // Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      // Фабрика, перехватываем ошибку, кастомизируем её и выкидываем 400 с собранными данными
      exceptionFactory: (errors) => {
        const customErrors: CustomError[] = [];
        errors.forEach((e) => {
          //Происходит перебор каждой ошибки e в исходном массиве,
          //достаём данные из errors.constraints и преобразуем в массив
          const constraintKeys = Object.keys(e.constraints!); //Для каждой ошибки извлекается объект constraints, и его ключи преобразуются в массив строк constraintKeys.
          constraintKeys.forEach((cKey) => {
            // Каждый ключ cKey из массива constraintKeys перебирается внутри вложенного цикла.
            const msg = e.constraints![cKey]; //Сохраняется сообщение об ошибке для конкретного ключа cKey из constraints.
            customErrors.push({ field: e.property, message: msg }); // Для каждого ключа cKey создается новый объект с полями field (свойство property из исходной ошибки) и message (сообщение об ошибке из constraints), который затем добавляется в массив customErrors.
          });
        });
        // Error 400
        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(
    /*new ErrorExceptionFilter(),*/ new HttpExceptionFilter(),
  );
};
