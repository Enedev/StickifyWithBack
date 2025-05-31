import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('songs')
export class Song {
  @PrimaryColumn()
  trackId: number;

  @Column()
  artistName: string;

  @Column()
  trackName: string;

  @Column()
  primaryGenreName: string;

  @Column()
  collectionName: string;

  @Column()
  artworkUrl100: string;

  @Column()
  releaseDate: string;

  @Column({ default: false })
  isUserUpload: boolean;

  @Column()
  collectionId: number;

  @Column()
  artistId: number;
}