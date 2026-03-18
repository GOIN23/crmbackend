//for swagger describe 400
export class ErrorMessageSwagger {
  message: string;
  field: string;
}

export class ErrorsMessagesSwaggerType {
  errorsMessages: ErrorMessageSwagger[];
}
//-------------------------------------------------
export class ReturnAccessJWTforSwagger {
  accessToken: string;
}
