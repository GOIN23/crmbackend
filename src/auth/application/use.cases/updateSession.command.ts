import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/infrastructure/auth.repository';

export class UpdateSessionCommand {
  constructor(
    public readonly userId: number,
    public readonly deviceId: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionHandler implements ICommandHandler<UpdateSessionCommand> {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: UpdateSessionCommand) {
    const decodeJwtRefreshToken = await this.jwtService.decode(
      command.refreshToken,
    );
    const iat = decodeJwtRefreshToken['iat'];
    const issuedAt = new Date(iat * 1000).toISOString();
    await this.authRepository.updateSession(
      command.userId,
      command.deviceId,
      issuedAt,
    );
  }
}
