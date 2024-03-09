import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './interfaces/request-with-user.interface';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import JwtRefreshAuthGuard from './guards/jwt-refresh-auth.guard';
import UserEntity from '../users/user.entity';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() { user, res }: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { token: refreshToken, cookie: refreshTokenCookie } =
      this.authService.getCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() { res, user }: RequestWithUser) {
    await this.usersService.removeRefreshToken(user.id);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@Req() { user }: RequestWithUser) {
    return user;
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  refresh(@Req() { user, res }: RequestWithUser): UserEntity {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(user.id);
    res.setHeader('Set-Cookie', accessTokenCookie);

    return user;
  }
}
