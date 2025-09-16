// src/song-ratings/song-ratings.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RatingsModule } from './song-ratings.module';
import { RatingsService } from './song-ratings.service';
import { RatingsController } from './song-ratings.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SongRating } from './entities/song-rating.entity';

describe('RatingsModule', () => {
  let ratingsService: RatingsService;
  let ratingsController: RatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RatingsModule],
    })
      .overrideProvider(getRepositoryToken(SongRating)) // sobrescribimos el repo real
      .useValue({}) // mock vacío o puedes añadir métodos (find, save, etc.)
      .compile();

    ratingsService = module.get<RatingsService>(RatingsService);
    ratingsController = module.get<RatingsController>(RatingsController);
  });

  it('should be defined', () => {
    expect(ratingsService).toBeDefined();
    expect(ratingsController).toBeDefined();
  });
});
