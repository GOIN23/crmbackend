import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthRepository } from 'src/auth/infrastructure/auth.repository';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-cookie') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(
    private readonly authrepository: AuthRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refreshToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '1234',
    });
  }

  async validate({
    userId,
    deviceId,
    iat,
  }: {
    userId: number;
    deviceId: string;
    iat: string;
  }) {
    const issuedAt = new Date(+iat * 1000).toISOString();
    const session = await this.authrepository.findSessionForCheckCookie(
      userId,
      deviceId,
      issuedAt,
    );
    if (!session) {
      throw new UnauthorizedException();
    }
    return { userId, deviceId };
  }
}
