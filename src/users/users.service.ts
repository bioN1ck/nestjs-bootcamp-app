import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import UserEntity from './user.entity';
import CreateUserDto from './dto/create-user.dto';
import { FilesService } from '../files/files.service';
import PublicFileEntity from '../files/public-file.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly filesService: FilesService,
  ) {}

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async addAvatar(
    userId: number,
    imageBuffer: Buffer,
    filename: string,
  ): Promise<PublicFileEntity> {
    const user = await this.getById(userId);
    if (user.avatar) {
      await this.deleteExistingAvatar(user);
    }
    const avatar = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
    );
    await this.usersRepository.update(userId, {
      ...user,
      avatar,
    });
    return avatar;
  }

  async deleteAvatar(userId: number): Promise<void> {
    const user = await this.getById(userId);
    await this.deleteExistingAvatar(user);
  }

  async deleteExistingAvatar(user: UserEntity) {
    const fileId = user.avatar?.id;
    if (fileId) {
      await this.usersRepository.update(user.id, {
        ...user,
        avatar: null,
      });
      await this.filesService.deletePublicFile(fileId);
    }
  }

  async getByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
