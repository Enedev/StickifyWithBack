export interface Playlist {
  id: string;
  name: string;
  trackIds: string[]; 
  cover?: string;
  type: 'user' | 'auto';
  createdAt: Date;
  createdBy?: string | null
}