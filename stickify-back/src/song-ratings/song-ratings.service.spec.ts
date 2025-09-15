import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './song-ratings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SongRating } from './entities/song-rating.entity';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-song-rating.dto';

describe('RatingsService', () => {
  let service: RatingsService;
  let repository: Repository<SongRating>;

  const mockRating: SongRating = {
    userId: 'user123',
    trackId: 42,
    rating: 4,
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => ({ ...dto })),
    save: jest.fn().mockResolvedValue(mockRating),
    find: jest.fn().mockResolvedValue([mockRating]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: getRepositoryToken(SongRating), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    repository = module.get<Repository<SongRating>>(getRepositoryToken(SongRating));
  });

  it('should insert a new rating if none exists', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const dto: CreateRatingDto = {
      userId: 'user123',
      trackId: 42,
      rating: 5,
    };

    const result = await service.upsert(dto);

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { userId: dto.userId, trackId: dto.trackId },
    });
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockRating);
  });

  it('should update existing rating if found', async () => {
    const existing = { ...mockRating, rating: 3 };
    mockRepository.findOne.mockResolvedValue(existing);

    const dto: CreateRatingDto = {
      userId: 'user123',
      trackId: 42,
      rating: 5,
    };

    const result = await service.upsert(dto);

    expect(existing.rating).toBe(5);
    expect(mockRepository.save).toHaveBeenCalledWith(existing);
    expect(result).toEqual(mockRating);
  });

  it('should return all ratings', async () => {
    const result = await service.findAll();

    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual([mockRating]);
  });

  it('should return ratings by userId', async () => {
    const result = await service.findByUserId('user123');

    expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 'user123' } });
    expect(result).toEqual([mockRating]);
  });

  it('should return ratings by trackId', async () => {
    const result = await service.findByTrackId(42);

    expect(mockRepository.find).toHaveBeenCalledWith({ where: { trackId: 42 } });
    expect(result).toEqual([mockRating]);
  });

  it('should return average rating for a track', async () => {
    mockRepository.find.mockResolvedValue([
      { userId: 'u1', trackId: 42, rating: 4 },
      { userId: 'u2', trackId: 42, rating: 5 },
      { userId: 'u3', trackId: 42, rating: 3 },
    ]);

    const result = await service.getAverageRating(42);

    expect(result).toBeCloseTo(4);
  });

  it('should return 0 if no ratings found for track', async () => {
    mockRepository.find.mockResolvedValue([]);

    const result = await service.getAverageRating(999);

    expect(result).toBe(0);
  });
});
