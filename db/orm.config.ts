import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// import { UpdatePostsContentToParagraphs1711530483736 } from './migrations/1711530483736-update-posts-content-to-paragraphs';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: ['src/**/*.entity.ts'],
  migrations: [
    // UpdatePostsContentToParagraphs1711530483736
  ],
});
