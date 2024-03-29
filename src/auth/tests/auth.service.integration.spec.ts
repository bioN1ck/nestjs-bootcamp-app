// https://wanago.io/2020/07/13/api-nestjs-testing-services-controllers-integration-tests/

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { mockedConfigService } from '../../utils/mocks/config.service';
import { mockedJwtService } from '../../utils/mocks/jwt.service';
import UserEntity from '../../users/user.entity';
import mockedUser from './user.mock';
import { FilesService } from '../../files/files.service';
import { mockedFilesService } from '../../utils/mocks/files.service';

jest.mock('bcrypt');

describe('The AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let bcryptCompare: jest.Mock;
  let userData: UserEntity;
  let findUser: jest.Mock;

  beforeEach(async () => {
    userData = { ...mockedUser };
    findUser = jest.fn().mockReturnValue(userData);
    const usersRepository = {
      findOne: findUser,
    };

    bcryptCompare = jest.fn().mockReturnValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    const module = await Test.createTestingModule({
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
          provide: FilesService,
          useValue: mockedFilesService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: usersRepository,
        },
      ],
    }).compile();

    authService = await module.get(AuthService);
    usersService = await module.get(UsersService);
  });

  describe('when accessing the data of authenticating user', () => {
    it('should attempt to get a user by email', async () => {
      const getByEmailSpy = jest.spyOn(usersService, 'getByEmail');
      await authService.getAuthenticatedUser(
        'user@email.com',
        'strongPassword',
      );

      expect(getByEmailSpy).toBeCalledTimes(1);
    });

    describe('and the provided password is not valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(false);
      });
      it('should throw an error', async () => {
        await expect(
          authService.getAuthenticatedUser('user@email.com', 'strongPassword'),
        ).rejects.toThrow();
      });
    });

    describe('and the provided password is valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(true);
      });
      describe('and the user is found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(userData);
        });
        it('should return the user data', async () => {
          const user = await authService.getAuthenticatedUser(
            'user@email.com',
            'strongPassword',
          );

          expect(user).toBe(userData);
        });
      });

      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findUser.mockResolvedValue(undefined);
        });
        it('should throw an error', async () => {
          await expect(
            authService.getAuthenticatedUser(
              'user@email.com',
              'strongPassword',
            ),
          ).rejects.toThrow();
        });
      });
    });
  });
});
