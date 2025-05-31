export class UpdatePlaylistDto {
  name?: string;
  trackIds?: string[];
  cover?: string;
  type?: 'user' | 'auto';
}