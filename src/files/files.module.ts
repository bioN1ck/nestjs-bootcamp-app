import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import PublicFileEntity from './public-file.entity';
import { FilesService } from './files.service';

@Module({
  imports: [TypeOrmModule.forFeature([PublicFileEntity]), ConfigModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
