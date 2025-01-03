import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentCommand } from './create-comment.command';
import { CommentEntity } from '../entities';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentEntity> {
    const newPost = this.commentsRepository.create({
      ...command.comment,
      author: command.author,
    });

    await this.commentsRepository.save(newPost);

    return newPost;
  }
}
