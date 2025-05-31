import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SongRating } from './entities/song-rating.entity';

@Injectable()
export class SongRatingsService {
  constructor(
    @InjectRepository(SongRating)
    private ratingsRepository: Repository<SongRating>,
  ) {}

  async rateSong(userId: string, trackId: number, rating: number): Promise<SongRating> {
    const existing = await this.ratingsRepository.findOne({ where: { userId, trackId } });
    
    if (existing) {
      existing.rating = rating;
      return this.ratingsRepository.save(existing);
    }
    
    return this.ratingsRepository.save({ userId, trackId, rating });
  }

  async getSongRatings(trackId: number): Promise<{ [userId: string]: number }> {
    const ratings = await this.ratingsRepository.find({ where: { trackId } });
    return ratings.reduce((acc, curr) => {
      acc[curr.userId] = curr.rating;
      return acc;
    }, {});
  }

  async getAverageRating(trackId: number): Promise<number> {
    const result = await this.ratingsRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .where('r.trackId = :trackId', { trackId })
      .getRawOne();

    return parseFloat(result.avg) || 0;
  }
}