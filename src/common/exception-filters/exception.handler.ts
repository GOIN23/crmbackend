import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export type ExceptionResultType<T> = {
  data: T;
  code: ResultCode;
  field?: string;
  message?: string;
  response?: any;
};

export enum ResultCode {
  Success,
  BadRequest,
  NotFound,
  Forbidden,
  Unauthorized,
  Conflict,
  ServerError,
}

export const exceptionHandler = (
  code: ResultCode,
  message?: string,
  field?: string,
) => {
  const exceptionObject = {
    message: [
      {
        message: message,
        field: field,
      },
    ],
  };
  switch (code) {
    case ResultCode.BadRequest: {
      throw new BadRequestException(exceptionObject);
    }
    case ResultCode.NotFound: {
      throw new NotFoundException(exceptionObject);
    }
    case ResultCode.Forbidden: {
      throw new ForbiddenException(exceptionObject);
    }
    case ResultCode.Conflict: {
      throw new ConflictException(exceptionObject);
    }
    case ResultCode.ServerError: {
      throw new InternalServerErrorException(exceptionObject);
    }
  }
};
