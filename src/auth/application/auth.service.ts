import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginInputModelType } from '../api/models/input/auth-input.model';
import { AuthQueryRepository } from '../infrastructure/auth-query.repository';

//TODO надо все что взаимодействует с бд перенисти в репозитории
@Injectable()
export class AuthService {
  constructor(private authqueryrepository: AuthQueryRepository) {}

  async checkCredentials(loginDTO: LoginInputModelType) {
    const user = await this.authqueryrepository.findUserByLoginOrEmail(
      loginDTO.loginOrEmail,
    );
    if (!user) {
      return {
        code: '401',
        message: 'User not found',
        data: null,
      };
    }
    // const passwordHash = await this._generateHash(
    //   loginDTO.password,
    //   user.passwordSalt,
    // );
    const isPasswordValid = bcrypt.compareSync(
      loginDTO.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return {
        code: '401',
        message: 'login/email/password has been incorrect',
        data: null,
      };
    }
    return {
      code: '200',
      message: 'User has been found',
      data: user,
    };
  }
}
