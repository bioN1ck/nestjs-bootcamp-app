// https://wanago.io/2020/07/06/api-nestjs-unit-tests/

import { Repository } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as Joi from 'joi';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import UserEntity from '../../users/user.entity';
import { UsersModule } from '../../users/users.module';
import { DatabaseModule } from '../../database/database.module';
import { mockedConfigService } from '../../utils/mocks/config.service';
import { mockedJwtService } from '../../utils/mocks/jwt.service';

describe('The AuthService', () => {
  let authService: AuthService;
  beforeEach(async () => {
    // authService = new AuthService(
    //   new UsersService(new Repository<UserEntity>()),
    //   new JwtService({
    //     secretOrPrivateKey: 'Secret key',
    //   }),
    //   new ConfigService(),
    // );
    const module = await Test.createTestingModule({
      // imports: [
      //   // UsersModule,
      //   ConfigModule.forRoot({
      //     validationSchema: Joi.object({
      //       POSTGRES_HOST: Joi.string().required(),
      //       POSTGRES_PORT: Joi.number().required(),
      //       POSTGRES_USER: Joi.string().required(),
      //       POSTGRES_PASSWORD: Joi.string().required(),
      //       POSTGRES_DB: Joi.string().required(),
      //       JWT_SECRET: Joi.string().required(),
      //       JWT_EXPIRATION_TIME: Joi.string().required(),
      //       PORT: Joi.number(),
      //     }),
      //   }),
      //   // DatabaseModule,
      //   JwtModule.registerAsync({
      //     imports: [ConfigModule],
      //     inject: [ConfigService],
      //     useFactory: async (configService: ConfigService) => ({
      //       secret: configService.get('JWT_SECRET'),
      //       signOptions: {
      //         expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
      //       },
      //     }),
      //   }),
      // ],
      providers: [
        AuthService,
        UsersService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
      ],
    }).compile();

    authService = await module.get(AuthService);
  });

  describe('when creating a cookie', () => {
    it('should return a string', () => {
      const userId = 1;
      expect(typeof authService.getCookieWithJwtToken(userId)).toEqual(
        'string',
      );
    });
  });
});
