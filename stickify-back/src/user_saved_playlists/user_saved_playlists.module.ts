// src/user-saved-playlists/user-saved-playlists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSavedPlaylistsService } from './user_saved_playlists.service';
import { UserSavedPlaylistsController } from './user_saved_playlists.controller';
import { UserSavedPlaylist } from './entities/user_saved_playlist.entity';
import { Playlist } from '../playlists/entities/playlist.entity'; // Ajusta la ruta si es necesario
import { User } from '../user/entities/user.entity'; // Ajusta la ruta si es necesario

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSavedPlaylist, Playlist, User]), // Importa las entidades
  ],
  controllers: [UserSavedPlaylistsController],
  providers: [UserSavedPlaylistsService],
  exports: [UserSavedPlaylistsService], // Exporta el servicio si otros módulos lo necesitan
})
export class UserSavedPlaylistsModule {}