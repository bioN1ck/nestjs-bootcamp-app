import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    PassportModule.register({}),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshTokenStrategy, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
