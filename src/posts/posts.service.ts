import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import CreatePostDto from './dto/create-post.dto';
import UpdatePostDto from './dto/update-post.dto';
import PostEntity from './post.entity';
import { PostNotFoundException } from './exception/post-not-found.exception';
import UserEntity from '../users/user.entity';

@Injectable()
export default class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
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
    return newPost;
  }

  async updatePost(id: number, post: UpdatePostDto): Promise<PostEntity> {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne(
      id,
      // This return the updated post with the author
      { relations: ['author'] },
    );
    if (updatedPost) {
      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async deletePost(id: number): Promise<void> {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
  }
}
