import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'apigateway.development',
  PRODUCTION = 'apigateway.production',
  TESTING = 'apigateway.testing',
  STAGING = 'apigateway.staging',
}

@Injectable()
export class ParsingConfig {
  @IsEnum(Environment)
  env: string = this.configService.get('NODE_ENV') as string;

  @IsNotEmpty({ message: 'Set env variable PORT' })
  @IsNumber({}, { message: 'Env variable PORT has to type of number' })
  @Min(1000)
  port: number = Number(this.configService.get('PORT')) as number;

  @IsNotEmpty({ message: 'Set env variable TOKEN' })
  @IsString({ message: 'Env variable TOKEN has to type of number' })
  token: string = this.configService.get('TOKEN') as string;

  @IsNotEmpty({ message: 'Set env variable EMAIL_CONFIRM_URL' })
  @IsString({ message: 'Env variable EMAIL_CONFIRM_URL has to type of string' })
  dbUrl: string = this.configService.get('DATABASE_URL') as string;
  constructor(private configService: ConfigService) {}
}
