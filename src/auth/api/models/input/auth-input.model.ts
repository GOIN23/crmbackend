import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInputModelType {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
