import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import CategoryEntity from './category.entity';
import CategoryNotFoundException from './exceptions/category-not-found.exception';
import CreateCategoryDto from './dto/create-category.dto';
import UpdateCategoryDto from './dto/update-category.dto';

@Injectable()
export default class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  getAllCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({ relations: ['posts'] });
  }

  async getCategoryById(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne(
      id,
      // Some comment for fix prettier alarms
      { relations: ['posts'] },
    );
    if (category) {
      return category;
    }
    throw new CategoryNotFoundException(id);
  }

  async createCategory(category: CreateCategoryDto): Promise<CategoryEntity> {
    const newCategory = await this.categoryRepository.create(category);
    await this.categoryRepository.save(newCategory);

    return newCategory;
  }

  async updateCategory(
    id: number,
    category: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    await this.categoryRepository.update(id, category);
    const updateCategory = await this.categoryRepository.findOne(
      id,
      // For categories with their posts
      { relations: ['posts'] },
    );
    if (updateCategory) {
      return updateCategory;
    }
    throw new CategoryNotFoundException(id);
  }

  async deleteCategory(id: number): Promise<void> {
    const deleteResponse = await this.categoryRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new CategoryNotFoundException(id);
    }
  }
}
