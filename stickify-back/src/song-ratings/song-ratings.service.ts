// src/song-ratings/song-ratings.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SongRating } from './entities/song-rating.entity';
import { CreateRatingDto } from './dto/create-song-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(SongRating)
    private ratingsRepository: Repository<SongRating>,
  ) {}

  async upsert(createRatingDto: CreateRatingDto): Promise<SongRating> {
    const existing = await this.ratingsRepository.findOne({
      where: {
        userId: createRatingDto.userId,
        trackId: createRatingDto.trackId,
      },
    });

    if (existing) {
      existing.rating = createRatingDto.rating;
      return this.ratingsRepository.save(existing);
    }

    const newRating = this.ratingsRepository.create(createRatingDto);
    return this.ratingsRepository.save(newRating);
  }

  async findAll(): Promise<SongRating[]> {
    return this.ratingsRepository.find();
  }

  // NEW: Find ratings by userId
  async findByUserId(userId: string): Promise<SongRating[]> {
    return this.ratingsRepository.find({ where: { userId } });
  }

  async findByTrackId(trackId: number): Promise<SongRating[]> {
    return this.ratingsRepository.find({ where: { trackId } });
  }

  async getAverageRating(trackId: number): Promise<number> {
    const ratings = await this.findByTrackId(trackId);
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    return total / ratings.length;
  }
}