// src/user-saved-playlists/entities/user-saved-playlist.entity.ts
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity'; // Asume que tienes una entidad User

@Entity('user_saved_playlists')
export class UserSavedPlaylist {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text' }) // Asumiendo que user_id es el email o username del usuario
  user_id: string;

  @Column({ type: 'text' })
  playlist_id: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  saved_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'email' }) 
  user!: User; 
}