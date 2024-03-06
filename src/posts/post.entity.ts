import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';

import UserEntity from '../users/user.entity';
import CategoryEntity from '../categories/category.entity';

@Entity('post')
class PostEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @Column({ nullable: true })
  // Small hack to exclude nullable property from get-requests
  // @Transform(({ value }) => {
  //   if (value !== null) {
  //     return value;
  //   }
  // })
  public category?: string;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.posts)
  public author: UserEntity;

  // When we use the  @ManyToMany() and  @JoinTable() decorators, TypeORM set up an additional table.
  // This way, neither the Post nor Category table stores the data about the relationship.
  @ManyToMany(
    () => CategoryEntity,
    (category: CategoryEntity) => category.posts,
  )
  @JoinTable() // Only on one side needed
  public categories: CategoryEntity[];
}

export default PostEntity;
