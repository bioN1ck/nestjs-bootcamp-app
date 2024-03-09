import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import UserEntity from '../../users/user.entity';

interface RequestWithCookieRefreshToken extends Request {
  request?: {
    cookies?: {
      Refresh: string;
    };
  };
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(readonly configService: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestWithCookieRefreshToken) => request?.cookies?.Refresh,
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: RequestWithCookieRefreshToken,
    payload: TokenPayload,
  ): Promise<UserEntity> {
    const refreshToken = request?.cookies?.Refresh;

    return this.usersService.getUserIfRefreshTokenMatches(refreshToken, payload.userId);
  }
}
