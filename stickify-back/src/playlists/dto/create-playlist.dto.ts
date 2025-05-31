export class CreatePlaylistDto {
  id: string;
  name: string;
  trackIds: string[];
  cover?: string;
  type: 'user' | 'auto';
  createdBy?: string;
}