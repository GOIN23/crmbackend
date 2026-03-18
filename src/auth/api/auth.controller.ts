import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginGuard } from '../guards/local/local.strategy';
import { JwtAccessAuthGuard } from '../guards/jwt/jwt-header.strategy';
import { JwtRefreshAuthGuard } from '../guards/jwt/jwt-cookie.strategy';
import { JWTService } from '../common/jwt/jwt.service';
import { CreateDeviceSessionCommand } from '../application/use.cases/createDeviceSession.command';
import { FindSessionByUserIdAndDeviceIdCommand } from '../application/use.cases/findSessionByUserIdAndDeviceId.command';
import { UpdateSessionCommand } from '../application/use.cases/updateSession.command';
import { AuthQueryRepository } from '../infrastructure/auth-query.repository';
import { DeleteSessionCommand } from '../application/use.cases/deleteSession.command';
import { TakeUserId } from '../decorators/authMeTakeUserId.decorator';
import { RefreshPayload } from '../decorators/accessPayload.decorator';
import { UserAgent } from '../decorators/userAgent.decorator';
import { CurrentUserId } from '../decorators/currentUserId.decorator';
import { LoginInputModelType } from './models/input/auth-input.model';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWTService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @HttpCode(200)
  @UseGuards(LoginGuard)
  @Post('login')
  async signIn(
    @Body() loginDTO: LoginInputModelType,
    @UserAgent() deviceName: string,
    @CurrentUserId() userId: number,
    @Ip() ip: string,
    @Res({ passthrough: true })
    res: Response,
    @Req() req: Request,
  ) {
    const deviceId = randomUUID();
    const tokensPair = await this.jwtService.createJWT(userId, deviceId);
    const validatedTimezone = (req.headers['x-timezone'] as string) || 'UTC';
    await this.commandBus.execute(
      new CreateDeviceSessionCommand(
        tokensPair.refreshToken,
        deviceName,
        ip,
        validatedTimezone,
      ),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { accessToken: tokensPair.accessToken };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req,
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
  ) {
    const session = await this.commandBus.execute(
      new FindSessionByUserIdAndDeviceIdCommand(userId, deviceId),
    );
    //todo значит надо найти сессию по девайс айди и проверить есть ли она и моя ли она
    if (!session) {
      throw new UnauthorizedException();
    }
    res.clearCookie('refreshToken');
    await this.commandBus.execute(new DeleteSessionCommand(userId, deviceId));
  }

  @HttpCode(200)
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  async refreshTokens(
    @RefreshPayload()
    { userId, deviceId }: { userId: number; deviceId: string },
    @Res({ passthrough: true })
    res: Response,
  ) {
    const tokensPair = await this.jwtService.createJWT(userId, deviceId);
    await this.commandBus.execute(
      new UpdateSessionCommand(userId, deviceId, tokensPair.refreshToken),
    );
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { accessToken: tokensPair.accessToken };
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('me')
  async authMe(@TakeUserId() { userId }: { userId: number }) {
    const authMe = await this.authQueryRepository.getUserByIdForAuthMe(userId);
    if (!authMe) {
      throw new NotFoundException();
    }
    return authMe;
  }
}
