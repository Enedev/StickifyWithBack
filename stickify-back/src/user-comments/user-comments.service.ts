import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserComment } from './entities/user-comment.entity';

@Injectable()
export class UserCommentsService {
  constructor(
    @InjectRepository(UserComment)
    private commentsRepository: Repository<UserComment>,
  ) {}

  create(comment: Partial<UserComment>): Promise<UserComment> {
    return this.commentsRepository.save(comment);
  }

  findAll(): Promise<UserComment[]> {
    return this.commentsRepository.find();
  }

  findOne(id: string): Promise<UserComment | null> {
    return this.commentsRepository.findOne({ where: { id } });
  }

  update(id: string, updateData: Partial<UserComment>): Promise<UserComment> {
    return this.commentsRepository.save({ id, ...updateData });
  }

  async remove(id: string): Promise<void> {
    await this.commentsRepository.delete(id);
  }
}