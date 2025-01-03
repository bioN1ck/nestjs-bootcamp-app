import { ICommand } from '@nestjs/cqrs';

import { CreateCommentDto } from '../dtos';
import UserEntity from '../../users/user.entity';

export class CreateCommentCommand implements ICommand {
  constructor(
    public readonly comment: CreateCommentDto,
    public readonly author: UserEntity,
  ) {}
}
