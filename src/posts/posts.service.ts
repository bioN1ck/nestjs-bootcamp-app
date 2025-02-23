import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions, MoreThan } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import CategoryEntity from '../categories/category.entity';
import CreatePostDto from './dto/create-post.dto';
import PostEntity from './post.entity';
import { PostNotFoundException } from './exception/post-not-found.exception';
import PostsSearchService from './posts-search.service';
import UpdatePostDto from './dto/update-post.dto';
import UserEntity from '../users/user.entity';
import PostsResponseDto from './dto/posts-response.dto';
import { GET_POSTS_CACHE_KEY } from './posts-cache-key.constant';

@Injectable()
export default class PostsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly _cacheManager: Cache,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    private readonly postsSearchService: PostsSearchService,
  ) {}

  async getAllPosts(
    offset?: number, // Use for offset-pagination
    limit?: number,
    startId?: number, // Use for keyset-pagination
  ): Promise<PostsResponseDto> {
    const where: FindManyOptions<PostEntity>['where'] = {};
    let separateCount = 0;
    let skip = offset;
    if (startId) {
      where.id = MoreThan(startId);
      skip = 0; // Priority of keyset over offset pagination.
      separateCount = await this.postsRepository.count();
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where,
      relations: { author: true, categories: true },
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  async getPostById(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        author: true,
        categories: true,
      },
    });
    if (!post) {
      throw new PostNotFoundException(id);
    }

    return post;
  }

  async clearCache(): Promise<boolean> {
    if (!this._cacheManager.store.keys) {
      return false;
    }

    for (const key of await this._cacheManager.store.keys()) {
      if (key.startsWith(GET_POSTS_CACHE_KEY)) {
        await this._cacheManager.del(key);
      }
    }
  }

  async createPost(
    { title, paragraphs, categoryIds = [] }: CreatePostDto,
    user: UserEntity,
  ): Promise<PostEntity> {
    const categories = await this.categoriesRepository.findBy({
      id: In(categoryIds),
    });
    const newPost = this.postsRepository.create({
      title,
      paragraphs,
      categories,
      author: user,
    });
    await this.postsRepository.save(newPost);
    await this.postsSearchService.indexPost(newPost);
    await this.clearCache();

    return newPost;
  }

  async searchPosts(
    text: string,
    offset?: number, // Use for offset-pagination
    limit?: number,
    startId?: number, // Use for keyset-pagination
  ): Promise<PostsResponseDto> {
    const { results, count } = await this.postsSearchService.search(
      text,
      offset,
      limit,
      startId,
    );
    const ids = results.map((r) => r.id);
    if (!ids.length) {
      return {
        items: [],
        count: 0,
      };
    }

    const posts = await this.postsRepository.find({
      where: { id: In(ids) },
      relations: { author: true, categories: true },
      order: { id: 'ASC' },
    });

    return {
      items: posts,
      count,
    };
  }

  async updatePost(id: number, post: UpdatePostDto): Promise<PostEntity> {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne({
      where: { id },
      // This return the updated post with the author and categories
      relations: {
        author: true,
        categories: true,
      },
    });
    if (!updatedPost) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.update(updatedPost);
    await this.clearCache();

    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.remove(id);
    await this.clearCache();
  }
}
