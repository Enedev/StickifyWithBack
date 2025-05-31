import { Test, TestingModule } from '@nestjs/testing';
import { SongRatingsController } from './song-ratings.controller';
import { SongRatingsService } from './song-ratings.service';

describe('SongRatingsController', () => {
  let controller: SongRatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongRatingsController],
      providers: [SongRatingsService],
    }).compile();

    controller = module.get<SongRatingsController>(SongRatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
