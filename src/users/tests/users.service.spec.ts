import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from '../users.service';
import UserEntity from '../user.entity';
import { FilesService } from '../../files/files.service';

describe('The UsersService', () => {
  let usersService: UsersService;
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOne },
        },
        {
          provide: FilesService,
          useValue: {},
        },
      ],
    }).compile();

    usersService = await module.get(UsersService);
  });

  describe('when getting a user by email', () => {
    describe('and the user is matched', () => {
      let user: UserEntity;

      beforeEach(() => {
        user = new UserEntity();
        findOne.mockReturnValue(Promise.resolve(user));
      });

      it('should return the user', async () => {
        const fetchedUser = await usersService.getByEmail('test@test.com');
        expect(fetchedUser).toEqual(user);
      });
    });
    describe('and the user is not matched', () => {
      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      });

      it('should throw an error', async () => {
        await expect(
          usersService.getByEmail('test@test.com'),
        ).rejects.toThrow();
      });
    });
  });
});
