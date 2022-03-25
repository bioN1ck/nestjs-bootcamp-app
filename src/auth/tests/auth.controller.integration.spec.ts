// https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';

import { AuthController } from '../auth.controller';
import { mockedConfigService } from '../../utils/mocks/config.service';
import { mockedJwtService } from '../../utils/mocks/jwt.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import UserEntity from '../../users/user.entity';
import mockedUser from './user.mock';

describe('The AuthController', () => {
  let app: INestApplication;
  let userData: UserEntity;

  beforeEach(async () => {
    userData = { ...mockedUser };
    const usersRepository = {
      create: jest.fn().mockResolvedValue(userData),
      save: jest.fn().mockReturnValue(Promise.resolve()),
    };
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({})],
      controllers: [AuthController],
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
          useValue: usersRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('when registering', () => {
    describe('and using valid data', () => {
      it('should respond with the data of the user without the password', () => {
        const expectedData = {
          ...userData,
        };
        delete expectedData.password;
        const sendData = {
          email: mockedUser.email,
          name: mockedUser.name,
          password: 'strongPassword',
        };
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(sendData)
          .expect(201)
          .expect(expectedData);
      });
    });

    describe('and using invalid data', () => {
      it('should throw an error', () => {
        const sendData = {
          name: mockedUser.name,
        };
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(sendData)
          .expect(400);
      });
    });
  });
});
