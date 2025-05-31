import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCommentsService } from './user-comments.service';
import { UserCommentsController } from './user-comments.controller';
import { UserComment } from './entities/user-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserComment])],
  controllers: [UserCommentsController],
  providers: [UserCommentsService],
})
export class UserCommentsModule {}