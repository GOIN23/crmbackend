import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from 'src/auth/infrastructure/auth.repository';

export class DeleteSessionCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(private authRepository: AuthRepository) {}

  async execute(command: DeleteSessionCommand) {
    await this.authRepository.deleteSession(command.userId, command.deviceId);
  }
}
