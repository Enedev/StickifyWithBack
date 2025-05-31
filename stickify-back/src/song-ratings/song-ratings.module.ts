import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongRatingsService } from './song-ratings.service';
import { SongRatingsController } from './song-ratings.controller';
import { SongRating } from './entities/song-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SongRating])],
  controllers: [SongRatingsController],
  providers: [SongRatingsService],
})
export class SongRatingsModule {}