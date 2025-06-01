import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('song_ratings')
export class SongRating {
  @PrimaryColumn('text')
  userId: string;

  @PrimaryColumn()
  trackId: number;

  @Column('real')
  rating: number;
}