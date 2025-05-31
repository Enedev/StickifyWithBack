import { Test, TestingModule } from '@nestjs/testing';
import { UserCommentsController } from './user-comments.controller';
import { UserCommentsService } from './user-comments.service';

describe('UserCommentsController', () => {
  let controller: UserCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCommentsController],
      providers: [UserCommentsService],
    }).compile();

    controller = module.get<UserCommentsController>(UserCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
