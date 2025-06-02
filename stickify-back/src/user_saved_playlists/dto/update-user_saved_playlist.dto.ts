import { PartialType } from '@nestjs/mapped-types';
import { CreateUserSavedPlaylistDto } from './create-user_saved_playlist.dto';

export class UpdateUserSavedPlaylistDto extends PartialType(CreateUserSavedPlaylistDto) {}
