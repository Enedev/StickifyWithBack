import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('playlists')
export class Playlist {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('text', { array: true })
  trackIds: string[];

  @Column({ nullable: true })
  cover?: string;

  @Column()
  type: 'user' | 'auto';

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  createdBy?: string;
}