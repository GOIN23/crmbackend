import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from 'src/auth/infrastructure/auth.repository';

export class DeleteSessionExceptThisCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionExceptThisCommand)
export class DeleteSessionExceptThisHandler implements ICommandHandler<DeleteSessionExceptThisCommand> {
  constructor(private authRepository: AuthRepository) {}

  async execute(command: DeleteSessionExceptThisCommand) {
    await this.authRepository.deleteDevicesExceptThisOne(
      command.userId,
      command.deviceId,
    );
  }
}
