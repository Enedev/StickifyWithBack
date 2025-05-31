import { PartialType } from '@nestjs/mapped-types';
import { CreateSongRatingDto } from './create-song-rating.dto';

export class UpdateSongRatingDto extends PartialType(CreateSongRatingDto) {}
