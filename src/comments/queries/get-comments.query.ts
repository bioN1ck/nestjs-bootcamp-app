import { IQuery } from '@nestjs/cqrs';

export class GetCommentsQuery implements IQuery {
  constructor(public readonly postId?: number) {}
}
