import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TakeUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.userId;
    //todo Throw newError 500
    if (!userId) {
      return { userId: null };
    }
    return { userId };
  },
);
