import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserCommentsService } from './user-comments.service';
import { UserComment } from './entities/user-comment.entity';

@Controller('user-comments')
export class UserCommentsController {
  constructor(private readonly commentsService: UserCommentsService) {}

  @Post()
  create(@Body() comment: UserComment) {
    return this.commentsService.create(comment);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<UserComment>) {
    return this.commentsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}