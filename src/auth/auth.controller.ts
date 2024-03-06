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

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() { user, res }: RequestWithUser) {
    const cookie = this.authService.getCookieWithJwtToken(user.id);
    res.setHeader('Set-Cookie', cookie);

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() { res }: RequestWithUser) {
    res.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@Req() { user }: RequestWithUser) {
    return user;
  }
}
