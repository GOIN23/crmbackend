import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(private jwtService: JwtService) {}

  async createJWT(userId: number, deviceId: string) {
    return {
      accessToken: await this.jwtService.signAsync(
        { userId, deviceId },
        {
          secret: '1234',
          expiresIn: '600m',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { userId, deviceId },
        {
          secret: '1234',
          expiresIn: '600m',
        },
      ),
    };
  }
}
