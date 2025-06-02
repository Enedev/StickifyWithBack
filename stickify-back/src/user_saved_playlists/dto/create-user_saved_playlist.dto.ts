import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateUserSavedPlaylistDto {
  @IsUUID()
  id: string; // Client-generated UUID

  @IsString()
  user_id: string;

  @IsUUID()
  playlist_id: string;

  @IsOptional()
  @IsDateString()
  saved_at?: string; // Optional, as backend can set default
}