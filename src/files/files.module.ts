import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import PublicFileEntity from './public-file.entity';
import { FilesService } from './files.service';
import PrivateFileEntity from './private-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicFileEntity, PrivateFileEntity]),
    ConfigModule,
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
