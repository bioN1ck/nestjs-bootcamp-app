import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetCommentsQuery } from './get-comments.query';
import { CommentEntity } from '../entities';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
  ) {}

  async execute(query: GetCommentsQuery): Promise<CommentEntity[]> {
    if (query.postId) {
      return this.commentsRepository.find({
        where: { post: { id: query.postId } },
      });
    }

    return this.commentsRepository.find();
  }
}
