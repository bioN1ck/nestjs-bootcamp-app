import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { CommentEntity } from './entities';
import { CommentsController } from './controllers';
import { CreateCommentHandler } from './commands';
import { GetCommentsHandler } from './queries';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity]), CqrsModule],
  controllers: [CommentsController],
  providers: [CreateCommentHandler, GetCommentsHandler],
})
export class CommentsModule {}
