import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import JwtAuthGuard from '../../auth/guards/jwt-auth.guard';
import { CreateCommentDto, GetCommentsDto } from '../dtos';
import RequestWithUser from '../../auth/interfaces/request-with-user.interface';
import { CreateCommentCommand } from '../commands';
import { GetCommentsQuery } from '../queries';
import { CommentEntity } from '../entities';

@Controller('comments')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() comment: CreateCommentDto,
    @Req() { user }: RequestWithUser,
  ): Promise<CommentEntity> {
    return this.commandBus.execute(new CreateCommentCommand(comment, user));
  }

  @Get()
  async getComments(
    @Query() { postId }: GetCommentsDto,
  ): Promise<CommentEntity[]> {
    return this.queryBus.execute(new GetCommentsQuery(postId));
  }
}
