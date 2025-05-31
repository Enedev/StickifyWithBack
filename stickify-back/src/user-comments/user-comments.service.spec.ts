import { Test, TestingModule } from '@nestjs/testing';
import { UserCommentsService } from './user-comments.service';

describe('UserCommentsService', () => {
  let service: UserCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserCommentsService],
    }).compile();

    service = module.get<UserCommentsService>(UserCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
