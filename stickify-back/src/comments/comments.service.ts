// src/comments/comments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create(createCommentDto);
    return this.commentsRepository.save(comment);
  }

  findAll(): Promise<Comment[]> {
    return this.commentsRepository.find();
  }

  // NEW: Find comments by user ID (email)
  // UPDATE findCommentsByUser method
  findCommentsByUser(user: string): Promise<Comment[]> {
    return this.commentsRepository.find({ 
      where: { user } // Changed from 'user' to 'userId'
    });
  }

  findOne(id: string): Promise<Comment| null> {
    return this.commentsRepository.findOne({ where: { id } });
  }

  update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    return this.commentsRepository.save({ id, ...updateCommentDto });
  }

  async remove(id: string): Promise<void> {
    await this.commentsRepository.delete(id);
  }
}