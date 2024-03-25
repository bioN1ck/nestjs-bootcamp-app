import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: number) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this ID does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<UserEntity> {
    const user = await this.getById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async addAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<PublicFileEntity> {
    return this.usersRepository.manager.transaction(async (manager) => {
      const user = await manager.findOneBy(UserEntity, { id: userId });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.avatar) {
        await this.deleteExistingAvatar(user, manager);
      }

      const avatar = await this.filesService.uploadPublicFile(file, manager);
      if (!avatar) {
        throw new Error('Avatar not found');
      }
      await manager.update(UserEntity, userId, { avatar });

      return avatar;
    });
  }

  async deleteAvatar(userId: number): Promise<void> {
    await this.usersRepository.manager.transaction(async (manager) => {
      const user = await manager.findOneBy(UserEntity, { id: userId });
      if (!user) {
        throw new Error('User not found');
      }
      await this.deleteExistingAvatar(user, manager);
    });
  }

  async deleteExistingAvatar(
    user: UserEntity,
    manager: EntityManager,
  ): Promise<void> {
    const fileId = user.avatar?.id;
    if (fileId) {
      await manager.update(UserEntity, user.id, { avatar: null });
      await this.filesService.deletePublicFile(fileId, manager);
    }
  }

  async addPrivateFile(userId: number, imageBuffer: Buffer, filename: string) {
    return this.filesService.uploadPrivateFile(imageBuffer, userId, filename);
  }

  async getPrivateFile(userId: number, fileId: number) {
    const file = await this.filesService.getPrivateFile(fileId);
    if (file.info.owner.id !== userId) {
      throw new UnauthorizedException();
    }

    return file;
  }

  async getAllPrivateFiles(userId: number) {
    const userWithFiles = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { files: true },
    });
    if (!userWithFiles) {
      throw new NotFoundException('User with this ID does not exist');
    }

    return Promise.all(
      userWithFiles.files.map(async (file) => {
        const url = await this.filesService.generatePreSignedUrl(file.key);

        return { ...file, url };
      }),
    );
  }

  async getByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const newUser = this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);

    return newUser;
  }
}
