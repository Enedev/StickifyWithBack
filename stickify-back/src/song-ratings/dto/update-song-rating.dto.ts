import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-song-rating.dto';

export class UpdateSongRatingDto extends PartialType(CreateRatingDto) {}
