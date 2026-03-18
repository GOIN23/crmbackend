import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthQueryRepository {
  constructor(protected prismaService: PrismaService) {}

  async findAllSessionsByUserId(userId: number) {
    const data = await this.prismaService.session.findMany({
      where: { userId },
    });
    return data.map((session) => {
      return {
        ip: session.ip,
        title: session.deviceName,
        lastActiveDate: session.issuedAt.toISOString(),
        deviceId: session.deviceId,
        timezone: session.timezone || 'UTC',
      };
    });
  }

  async findSessionByUserId(userId: number, deviceId: string) {
    const data = await this.prismaService.session.findFirst({
      where: { userId, deviceId },
    });

    return data;
  }

  async getUserByIdForAuthMe(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const userMapped: any = {
      userId: user.id,
      login: user.userName,
    };

    return userMapped;
  }

  async findUserByLoginOrEmail(userName: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        userName: userName,
      },
    });
    return user;
  }
}
