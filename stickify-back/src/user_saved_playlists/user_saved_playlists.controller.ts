// src/user-saved-playlists/user-saved-playlists.controller.ts
import { Controller, Post, Get, Param, Body, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UserSavedPlaylistsService } from './user_saved_playlists.service';

@Controller('user-saved-playlists')
export class UserSavedPlaylistsController {
  constructor(private readonly userSavedPlaylistsService: UserSavedPlaylistsService) {}

  /**
   * Endpoint para guardar una playlist en el perfil de un usuario.
   * @param body Contiene user_id y playlist_id.
   * @returns La entrada de la playlist guardada.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async savePlaylist(@Body() body: { userId: string; playlistId: string }) {
    return this.userSavedPlaylistsService.savePlaylist(body.userId, body.playlistId);
  }

  /**
   * Endpoint para verificar si una playlist ha sido guardada por un usuario.
   * @param userId El ID del usuario.
   * @param playlistId El ID de la playlist.
   * @returns `true` si está guardada, `false` en caso contrario.
   */
  @Get('check/:userId/:playlistId')
  async isPlaylistSaved(
    @Param('userId') userId: string,
    @Param('playlistId') playlistId: string,
  ): Promise<boolean> {
    return this.userSavedPlaylistsService.isPlaylistSaved(userId, playlistId);
  }

  /**
   * Endpoint para obtener todas las playlists guardadas por un usuario.
   * Retorna los objetos Playlist completos.
   * @param userId El ID del usuario.
   * @returns Un array de objetos Playlist.
   */
  @Get('user/:userId/full')
  async getSavedPlaylists(@Param('userId') userId: string) {
    return this.userSavedPlaylistsService.getSavedPlaylists(userId);
  }

  /**
   * Endpoint para eliminar una playlist guardada del perfil de un usuario.
   * @param userId El ID del usuario.
   * @param playlistId El ID de la playlist a eliminar.
   * @returns `true` si se eliminó, `false` si no se encontró.
   */
  @Delete(':userId/:playlistId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async deleteSavedPlaylist(
    @Param('userId') userId: string,
    @Param('playlistId') playlistId: string,
  ) {
    await this.userSavedPlaylistsService.deleteSavedPlaylist(userId, playlistId);
  }

  
}