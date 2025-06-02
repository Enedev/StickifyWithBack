// src/song-ratings/song-ratings.controller.ts
import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common'; // Add Param
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

  // NEW: Get ratings by user ID
  @Get('user/:userId') // e.g., /ratings/user/john@example.com
  async getRatingsByUser(@Param('userId') userId: string) {
    return this.ratingsService.findByUserId(userId);
  }

  @Get('average')
  async getAverageRating(@Query('trackId') trackId: string) {
    const avg = await this.ratingsService.getAverageRating(+trackId);
    return { trackId, average: avg };
  }
}