import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import CreatePostDto from './dto/create-post.dto';
import UpdatePostDto from './dto/update-post.dto';
import PostEntity from './post.entity';
import UserEntity from '../users/user.entity';
import PostsSearchService from './posts-search.service';
import { PostNotFoundException } from './exception/post-not-found.exception';

@Injectable()
export default class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    private readonly postsSearchService: PostsSearchService,
  ) {}

  getAllPosts(): Promise<PostEntity[]> {
    // This return a list of the posts with the authors
    return this.postsRepository.find({ relations: ['author'] });
    // return this.postsRepository.find();
  }

  async getPostById(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne(
      id,
      // This return the post with the author
      { relations: ['author'] },
    );
    if (post) {
      return post;
    }
    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDto, user: UserEntity): Promise<PostEntity> {
    const newPost = await this.postsRepository.create({
      ...post,
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
      relations: ['author'],
    });
  }

  async updatePost(id: number, post: UpdatePostDto): Promise<PostEntity> {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne(
      id,
      // This return the updated post with the author
      { relations: ['author'] },
    );
    if (updatedPost) {
      await this.postsSearchService.update(updatedPost);

      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async deletePost(id: number): Promise<void> {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.remove(id);
  }
}
