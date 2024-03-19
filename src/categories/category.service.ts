import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import CategoryEntity from './category.entity';
import CategoryNotFoundException from './exceptions/category-not-found.exception';
import CreateCategoryDto from './dto/create-category.dto';
import PostEntity from '../posts/post.entity';
import UpdateCategoryDto from './dto/update-category.dto';

@Injectable()
export default class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
  ) {}

  async getAllCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({ relations: { posts: true } });
  }

  async getCategoryById(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { posts: true },
    });
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }

  async createCategory(category: CreateCategoryDto): Promise<CategoryEntity> {
    const newCategory = this.categoryRepository.create(category);
    await this.categoryRepository.save(newCategory);

    return newCategory;
  }

  async updateCategory(
    id: number,
    category: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    await this.categoryRepository.update(id, category);
    const updateCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: { posts: true }, // For categories with their posts
    });
    if (updateCategory) {
      return updateCategory;
    }
    throw new CategoryNotFoundException(id);
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: {
        posts: {
          categories: true,
        },
      },
    });
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    for (const post of category.posts) {
      post.categories = post.categories.filter((c) => c.id !== id);
      await this.postsRepository.save(post);
    }
    await this.categoryRepository.delete(id);
  }
}
