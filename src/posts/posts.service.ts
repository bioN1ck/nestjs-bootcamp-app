import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import CategoryEntity from '../categories/category.entity';
import CreatePostDto from './dto/create-post.dto';
import PostEntity from './post.entity';
import { PostNotFoundException } from './exception/post-not-found.exception';
import PostsSearchService from './posts-search.service';
import UpdatePostDto from './dto/update-post.dto';
import UserEntity from '../users/user.entity';

@Injectable()
export default class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    private readonly postsSearchService: PostsSearchService,
  ) {}

  getAllPosts(): Promise<PostEntity[]> {
    // This return a list of the posts with the authors and categories
    return this.postsRepository.find({
      relations: {
        author: true,
        categories: true,
      },
    });
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

  async createPost(
    { title, content, categoryIds = [] }: CreatePostDto,
    user: UserEntity,
  ): Promise<PostEntity> {
    const categories = await this.categoriesRepository.findBy({
      id: In(categoryIds),
    });
    const newPost = this.postsRepository.create({
      title,
      content,
      categories,
      author: user,
    });
    await this.postsRepository.save(newPost);
    this.postsSearchService.indexPost(newPost);

    return newPost;
  }

  async searchPosts(text: string): Promise<PostEntity[]> {
    const result = await this.postsSearchService.search(text);
    const ids = result.map((result) => result.id);
    if (!ids.length) {
      return [];
    }

    return this.postsRepository.find({
      where: { id: In(ids) },
      relations: {
        author: true,
        categories: true,
      },
    });
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

    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.remove(id);
  }
}
