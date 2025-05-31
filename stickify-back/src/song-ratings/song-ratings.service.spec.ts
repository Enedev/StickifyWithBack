import { Test, TestingModule } from '@nestjs/testing';
import { SongRatingsService } from './song-ratings.service';

describe('SongRatingsService', () => {
  let service: SongRatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SongRatingsService],
    }).compile();

    service = module.get<SongRatingsService>(SongRatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
