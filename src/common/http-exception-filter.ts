import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import * as process from 'process'; //импорт из express, работаем на низах

// @Catch(Error)
// // ErrorExceptionFilter должен имплементить ExceptionFilter(идёт как интерфейс,
// // у которого есть метод catch) =>
// export class ErrorExceptionFilter implements ExceptionFilter {
//   //host наш сервак
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp(); //говорим серваку переключится в http (host.switchToHttp()), он возвращает контекст
//     const response = ctx.getResponse<Response>(); //у контекста мы берем res
//     const error = exception as Error;
//     if (error.name === 'TokenExpiredError') {
//       // Ошибка истекшего токена
//       return response.status(HttpStatus.UNAUTHORIZED).json({
//         statusCode: HttpStatus.UNAUTHORIZED,
//         timestamp: new Date().toISOString(),
//         path: ctx.getRequest().url,
//         message: 'Token expired',
//       });
//     }
//     if (process.env.ENV !== 'PRODUCTION') {
//       return response
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ errorMessage: exception.toString(), stack: exception.stack });
//     } else {
//       return response
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json('INTERNAL SERVER ERROR');
//     }
//   }
// }

// https://docs.nestjs.com/exception-filters
// декоратор @Catch определяет какие ошибки мы перехватываем
@Catch(HttpException)
// HttpExceptionFilter должен имплементить ExceptionFilter(идёт как интерфейс,
// у которого есть метод catch) =>
export class HttpExceptionFilter implements ExceptionFilter {
  //host наш сервак
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); //говорим серваку переключится в http (host.switchToHttp()), он возвращает контекст
    const response = ctx.getResponse<Response>(); //у контекста мы берем res
    const request = ctx.getRequest<Request>(); //у контекста мы берем req
    const status = exception.getStatus(); //к нам приходит exception error, получаем status
    // ////если в status есть 401
    // if (status === HttpStatus.UNAUTHORIZED) {
    //   const errorsMessages: string[] = [];
    //   const responseBody: any = exception.getResponse();
    //   errorsMessages.push(responseBody, `statusCode: ${status}`);
    //   response.status(status).json({ errorsMessages });
    //   return;
    // }
    //если в status есть 400

    if (status === HttpStatus.BAD_REQUEST || status === HttpStatus.NOT_FOUND) {
      const errorsResponse: { errorsMessages: string[] } = {
        //создаём объек errorsResponse с массивом errorsMessages
        errorsMessages: [], //
      };
      //получим объкт в responseBody, чтобы пробежаться по ошибкам
      const responseBody: any = exception.getResponse();

      //если массив пробегаемся forEach и пушим в errorsResponse.errorsMessages
      if (Array.isArray(responseBody.message as string[])) {
        responseBody.message.forEach((e: string) =>
          errorsResponse.errorsMessages.push(e),
        );
      } else {
        errorsResponse.errorsMessages.push(responseBody.message);
      }
      //возращаем статус и массив ошибок
      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
