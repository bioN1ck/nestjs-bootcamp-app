import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import AddressEntity from './address.entity';
import UserEntity from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FilesModule } from '../files/files.module';

// When we want a set of providers to be available everywhere, we can use the  @Global() decorator
// Now, we don’t need to import the  UsersModule to use the  UsersService
// We should register a global module only once, and the best place for that is the root module
@Global()
@Module({
  controllers: [UsersController],
  imports: [
    FilesModule,
    PassportModule.register({}),
    TypeOrmModule.forFeature([UserEntity, AddressEntity]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
