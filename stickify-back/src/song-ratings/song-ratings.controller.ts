import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SongRatingsService } from './song-ratings.service';

@Controller('song-ratings')
export class SongRatingsController {
  constructor(private readonly ratingsService: SongRatingsService) {}

  @Post()
  rateSong(
    @Body('userId') userId: string,
    @Body('trackId') trackId: number,
    @Body('rating') rating: number
  ) {
    return this.ratingsService.rateSong(userId, trackId, rating);
  }

  @Get(':trackId')
  getRatings(@Param('trackId') trackId: number) {
    return this.ratingsService.getSongRatings(trackId);
  }

  @Get('average/:trackId')
  getAverage(@Param('trackId') trackId: number) {
    return this.ratingsService.getAverageRating(trackId);
  }
}