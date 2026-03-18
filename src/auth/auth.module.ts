import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { DeleteDeviceSessionHandler } from './application/use.cases/deleteDeviceSession.command';
import { UpdateSessionHandler } from './application/use.cases/updateSession.command';
import { FindSessionByUserIdAndDeviceIdHandler } from './application/use.cases/findSessionByUserIdAndDeviceId.command';
import { DeleteSessionHandler } from './application/use.cases/deleteSession.command';
import { CreateDeviceSessionHandler } from './application/use.cases/createDeviceSession.command';
import { DeleteSessionExceptThisHandler } from './application/use.cases/deleteSessiomsDevicesExceptThisOne.command';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthQueryRepository } from './infrastructure/auth-query.repository';
import { JWTService } from './common/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtAccessStrategy } from './guards/jwt/jwt-header.strategy';
import { JwtStrategy } from './guards/jwt/jwt-cookie.strategy';

const commands = [
  DeleteDeviceSessionHandler,
  UpdateSessionHandler,
  FindSessionByUserIdAndDeviceIdHandler,
  DeleteSessionHandler,
  DeleteSessionExceptThisHandler,
  CreateDeviceSessionHandler,
];
const service = [
  AuthService,
  JWTService,
  JwtService,
  PrismaService,
  LocalStrategy,
  JwtAccessStrategy,
  JwtStrategy,
];
const repositories = [AuthRepository, AuthQueryRepository];

@Module({
  imports: [CqrsModule, PassportModule],
  controllers: [AuthController],
  providers: [...service, ...commands, ...repositories],
  exports: [],
})
export class AuthModule {}
