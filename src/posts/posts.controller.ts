import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

import PostsService from './posts.service';
import CreatePostDto from './dto/create-post.dto';
import UpdatePostDto from './dto/update-post.dto';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import FindOneParams from '../utils/find-one-params';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import PaginationParams from '../utils/types/pagination-params';
import PostsResponseDto from './dto/posts-response.dto';
import { GET_POSTS_CACHE_KEY } from './posts-cache-key.constant';
import { HttpCacheInterceptor } from './http-cache.interceptor';

@Controller('posts')
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_POSTS_CACHE_KEY)
  @CacheTTL(120_000)
  @Get()
  getPosts(
    @Query('search') search: string,
    @Query() { offset, limit, startId }: PaginationParams,
  ): Promise<PostsResponseDto> {
    if (search) {
      return this.postsService.searchPosts(search, offset, limit, startId);
    }

    return this.postsService.getAllPosts(offset, limit, startId);
  }

  @Get(':id')
  getPostById(@Param() { id }: FindOneParams) {
    return this.postsService.getPostById(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() post: CreatePostDto,
    @Req() { user }: RequestWithUser,
  ) {
    return this.postsService.createPost(post, user);
  }

  @Patch(':id')
  async updatePost(@Param('id') id: string, @Body() post: UpdatePostDto) {
    return this.postsService.updatePost(Number(id), post);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(Number(id));
  }
}
