// https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/

import {
  Controller,
  Delete,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { UsersService } from './users.service';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @Req() { user }: RequestWithUser,
    @UploadedFile() { buffer, originalname }: Express.Multer.File,
  ) {
    // The file above has quite a few useful properties such as the mimetype.
    // You can use it if you want some additional validation and disallow certain types of files
    return this.usersService.addAvatar(user.id, buffer, originalname);
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(@Req() { user }: RequestWithUser) {
    return this.usersService.deleteAvatar(user.id);
  }
}
