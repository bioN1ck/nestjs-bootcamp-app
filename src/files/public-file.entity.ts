import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class PublicFileEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public url: string;

  @Column()
  public key: string;
}

export default PublicFileEntity;
