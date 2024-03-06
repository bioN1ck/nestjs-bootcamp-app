import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import PostEntity from '../posts/post.entity';

@Entity('category')
class CategoryEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  // We can also make the many-to-many relationship bidirectional.
  // Remember to use the JoinTable decorator only on one side of the relationship, though
  @ManyToMany(() => PostEntity, (post: PostEntity) => post.categories)
  public posts: PostEntity[];
}

export default CategoryEntity;
