import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  id: string; 

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  trackIds: string[];

  @IsOptional()
  @IsString()
  cover?: string;

  @IsEnum(['user', 'auto'])
  type: 'user' | 'auto';

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsString()
  createdAt: string;
}