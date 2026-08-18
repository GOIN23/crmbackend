import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createJWT(userId: number, deviceId: string) {
    const secret = this.configService.get<string>('JWT_SECRET') || '1234';

    return {
      accessToken: await this.jwtService.signAsync(
        { userId, deviceId },
        {
          secret,
          expiresIn: '600m',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { userId, deviceId },
        {
          secret,
          expiresIn: '600m',
        },
      ),
    };
  }
}
