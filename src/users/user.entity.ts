import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import AddressEntity from './address.entity';
import PostEntity from '../posts/post.entity';
import PublicFileEntity from '../files/public-file.entity';
import PrivateFileEntity from '../files/private-file.entity';

@Entity('user')
class UserEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  // @Expose()
  public email: string;

  @Column()
  // @Expose()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @OneToOne(
    () => AddressEntity,
    // If we want our related entities always to be included, we can make our relationship EAGER
    // Now, every time we fetch users, we also get their addresses. Only one side of the relationship can be eager.
    // Thanks to CASCADE option, we can save an address while saving a user
    {
      eager: true,
      cascade: true,
    },
  )
  @JoinColumn()
  public address: AddressEntity;

  @OneToMany(() => PostEntity, (post: PostEntity) => post.author)
  public posts?: PostEntity[];

  @JoinColumn()
  @OneToOne(
    () => PublicFileEntity,
    // Comment for calming prettier
    {
      eager: true,
      nullable: true,
    },
  )
  public avatar?: PublicFileEntity;

  @OneToMany(() => PrivateFileEntity, (file: PrivateFileEntity) => file.owner)
  public files?: PrivateFileEntity[];
}

export default UserEntity;
