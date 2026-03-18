import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from 'src/auth/infrastructure/auth.repository';
import {
  exceptionHandler,
  ResultCode,
} from 'src/common/exception-filters/exception.handler';

export class DeleteDeviceSessionCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionHandler implements ICommandHandler<DeleteDeviceSessionCommand> {
  constructor(private authRepository: AuthRepository) {}

  async execute(command: DeleteDeviceSessionCommand): Promise<void> {
    const deviceSessionByDeviceId =
      await this.authRepository.findSessionByDeviceId(command.deviceId);
    if (!deviceSessionByDeviceId) {
      return exceptionHandler(
        ResultCode.NotFound,
        'DeviceSession has been not found',
      );
    }

    if (command.userId != deviceSessionByDeviceId.userId) {
      return exceptionHandler(
        ResultCode.Forbidden,
        'Is not your deviceSession',
      );
    }
    await this.authRepository.deleteSession(command.userId, command.deviceId);
  }
}
