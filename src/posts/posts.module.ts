import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';

import CategoryEntity from '../categories/category.entity';
import PostsController from './posts.controller';
import PostsService from './posts.service';
import PostEntity from './post.entity';
import PostsSearchService from './posts-search.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 15_000, // В миллисекундах (v5)
      max: 100,
    }),
    PassportModule.register({}), // TODO разобраться почему без этого не работает @UseGuards(JwtAuthGuard)
    TypeOrmModule.forFeature([CategoryEntity, PostEntity]),
    SearchModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsSearchService],
})
export class PostsModule {}
