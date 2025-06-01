// ratings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongRating } from './entities/song-rating.entity';
import { RatingsService } from './song-ratings.service';
import { RatingsController } from './song-ratings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SongRating])],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}
