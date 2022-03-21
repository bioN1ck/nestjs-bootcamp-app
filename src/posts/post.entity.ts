import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Transform } from 'class-transformer';

@Entity()
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
}

export default PostEntity;
