import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import CategoryEntity from './category.entity';
import CategoryService from './category.service';
import CategoryController from './category.controller';
import PostEntity from '../posts/post.entity';

@Module({
  imports: [
    PassportModule.register({}), // TODO разобраться почему без этого не работает @UseGuards(JwtAuthGuard)
    TypeOrmModule.forFeature([CategoryEntity, PostEntity]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
