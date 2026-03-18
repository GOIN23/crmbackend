import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from 'src/auth/infrastructure/auth.repository';

export class FindSessionByUserIdAndDeviceIdCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(FindSessionByUserIdAndDeviceIdCommand)
export class FindSessionByUserIdAndDeviceIdHandler implements ICommandHandler<FindSessionByUserIdAndDeviceIdCommand> {
  constructor(private authRepository: AuthRepository) {}

  async execute(command: FindSessionByUserIdAndDeviceIdCommand) {
    return this.authRepository.findSessionByUserIdAndDeviceId(
      command.userId,
      command.deviceId,
    );
  }
}
