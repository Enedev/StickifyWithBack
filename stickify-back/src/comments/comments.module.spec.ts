// src/comments/comments.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsModule } from './comments.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CommentsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommentsModule],
    })
      .overrideProvider(getRepositoryToken(Comment))
      .useValue({}) // mock del repositorio de Comment
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide CommentsService', () => {
    const service = module.get<CommentsService>(CommentsService);
    expect(service).toBeDefined();
  });

  it('should register CommentsController', () => {
    const controller = module.get<CommentsController>(CommentsController);
    expect(controller).toBeDefined();
  });
});
