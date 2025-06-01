import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RatingsService } from './song-ratings.service';
import { CreateRatingDto } from './dto/create-song-rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  async upsertRating(@Body() dto: CreateRatingDto) {
    return this.ratingsService.upsert(dto);
  }

  @Get()
  async getAllRatings() {
    return this.ratingsService.findAll();
  }

  @Get('average')
  async getAverageRating(@Query('trackId') trackId: string) {
    const avg = await this.ratingsService.getAverageRating(+trackId);
    return { trackId, average: avg };
  }
}
