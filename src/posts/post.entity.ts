import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import UserEntity from '../users/user.entity';
import CategoryEntity from '../categories/category.entity';

@Entity('post')
class PostEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column({ type: 'text', array: true, default: '{}' })
  public paragraphs: string[];

  @Index('post_author_id_index')
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
