import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './song-ratings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SongRating } from './entities/song-rating.entity';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-song-rating.dto';

describe('RatingsService', () => {
  let service: RatingsService;
  let repository: Repository<SongRating>;
  //Mock de objeto de rating
  const mockRating: SongRating = {
    userId: 'user123',
    trackId: 42,
    rating: 4,
  };
  //Mock del repositorio TypeORM 
  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => ({ ...dto })),
    save: jest.fn().mockResolvedValue(mockRating),
    find: jest.fn().mockResolvedValue([mockRating]),
  };

  beforeEach(async () => {
    //Arrange crea un modulo 
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        //Mock para inyectar el repositorio falso
        { provide: getRepositoryToken(SongRating), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    repository = module.get<Repository<SongRating>>(getRepositoryToken(SongRating));
  });

  it('should insert a new rating if none exists', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    //Arrange
    const dto: CreateRatingDto = {
      userId: 'user123',
      trackId: 42,
      rating: 5,
    };
    //Act
    const result = await service.upsert(dto);
    //Assert
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
    //Arrange
    const dto: CreateRatingDto = {
      userId: 'user123',
      trackId: 42,
      rating: 5,
    };
    //Act
    const result = await service.upsert(dto);
    //Assert
    expect(existing.rating).toBe(5);
    expect(mockRepository.save).toHaveBeenCalledWith(existing);
    expect(result).toEqual(mockRating);
  });

  it('should return all ratings', async () => {
    //Act
    const result = await service.findAll();
    //Assert
    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual([mockRating]);
  });

  it('should return ratings by userId', async () => {
    //Act
    const result = await service.findByUserId('user123');
    //Assert
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 'user123' } });
    expect(result).toEqual([mockRating]);
  });

  it('should return ratings by trackId', async () => {
    //Act
    const result = await service.findByTrackId(42);
    //Assert
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { trackId: 42 } });
    expect(result).toEqual([mockRating]);
  });

  it('should return average rating for a track', async () => {
    //Arrange
    mockRepository.find.mockResolvedValue([
      { userId: 'u1', trackId: 42, rating: 4 },
      { userId: 'u2', trackId: 42, rating: 5 },
      { userId: 'u3', trackId: 42, rating: 3 },
    ]);
    //Act
    const result = await service.getAverageRating(42);
    //Assert
    expect(result).toBeCloseTo(4);
  });

  it('should return 0 if no ratings found for track', async () => {
    //Arrange
    mockRepository.find.mockResolvedValue([]);
    //Act
    const result = await service.getAverageRating(999);
    //Assert
    expect(result).toBe(0);
  });
});
