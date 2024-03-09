import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { UsersService } from '../../users/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import UserEntity from '../../users/user.entity';

interface RequestWithCookieAuthToken extends Request {
  request?: {
    cookies?: {
      Refresh: string;
    };
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestWithCookieAuthToken) =>
          request?.cookies?.Authentication,
      ]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate({ userId }: TokenPayload): Promise<UserEntity> {
    return this.userService.getById(userId);
  }
}
