import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './song-ratings.controller';
import { RatingsService } from './song-ratings.service';
import { CreateRatingDto } from './dto/create-song-rating.dto';

describe('RatingsController', () => {
  let controller: RatingsController;
  let service: jest.Mocked<RatingsService>;

  const mockRating1 = { id: '1', userId: 'user1@mail.com', trackId: 101, rating: 4 };
  const mockRating2 = { id: '2', userId: 'user2@mail.com', trackId: 102, rating: 5 };
  const mockRating3 = { id: '3', userId: 'user3@mail.com', trackId: 103, rating: 3 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: {
            upsert: jest.fn(),
            findAll: jest.fn(),
            findByUserId: jest.fn(),
            getAverageRating: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<RatingsController>(RatingsController);
    service = module.get(RatingsService);
    jest.clearAllMocks();
  });

  describe('upsertRating', () => {
    it('should upsert a rating (3 times)', async () => {
      for (const rating of [mockRating1, mockRating2, mockRating3]) {
        service.upsert.mockResolvedValueOnce(rating);
        const dto: CreateRatingDto = { userId: rating.userId, trackId: rating.trackId, rating: rating.rating };
        expect(await controller.upsertRating(dto)).toEqual(rating);
      }
    });
  });

  describe('getAllRatings', () => {
    it('should return all ratings (3 times)', async () => {
      for (const arr of [
        [mockRating1],
        [mockRating2],
        [mockRating1, mockRating2, mockRating3],
      ]) {
        service.findAll.mockResolvedValueOnce(arr);
        expect(await controller.getAllRatings()).toEqual(arr);
      }
    });
  });

  describe('getRatingsByUser', () => {
    it('should return ratings by user (3 times)', async () => {
      for (const arr of [
        [mockRating1],
        [mockRating2],
        [mockRating1, mockRating2, mockRating3],
      ]) {
        service.findByUserId.mockResolvedValueOnce(arr);
        expect(await controller.getRatingsByUser(arr[0].userId)).toEqual(arr);
      }
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating (3 times)', async () => {
      const avgs = [4.5, 3, 5];
      const trackIds = [101, 102, 103];
      for (let i = 0; i < 3; i++) {
        service.getAverageRating.mockResolvedValueOnce(avgs[i]);
        expect(await controller.getAverageRating(trackIds[i].toString())).toEqual({ trackId: trackIds[i].toString(), average: avgs[i] });
      }
    });
  });
});
