import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // Import IsNull if you need it
import { UserSavedPlaylist } from './entities/user_saved_playlist.entity';
import { Playlist } from '../playlists/entities/playlist.entity';
import { User } from '../user/entities/user.entity';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'; // Import uuidValidate

@Injectable()
export class UserSavedPlaylistsService {
  private readonly logger = new Logger(UserSavedPlaylistsService.name);

  constructor(
    @InjectRepository(UserSavedPlaylist)
    private userSavedPlaylistRepository: Repository<UserSavedPlaylist>,
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async savePlaylist(userId: string, playlistIdentifier: string): Promise<UserSavedPlaylist> {
    this.logger.debug(`Attempting to save playlist. userId: ${userId}, identifier: ${playlistIdentifier}`);

    // 1. Verify user exists
    const user = await this.userRepository.findOne({ where: { email: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario no encontrado`);
    }

    // 2. Find playlist by ID or name (including auto playlists)
    let playlist = await this.playlistRepository.findOne({
      where: [
        { id: playlistIdentifier }, // Buscar por ID
        { name: playlistIdentifier } // Buscar por nombre
      ]
    });

    // 3. If not found and it's an auto playlist, create it
    if (!playlist && playlistIdentifier.startsWith('auto-')) {
      playlist = this.playlistRepository.create({
        id: playlistIdentifier, // Usamos el nombre como ID
        name: playlistIdentifier,
        createdBy: 'automatic',
        type: 'auto',
        createdAt: new Date().toISOString()
      });
      playlist = await this.playlistRepository.save(playlist);
      this.logger.log(`Created auto playlist: ${playlistIdentifier}`);
    }

    if (!playlist) {
      throw new NotFoundException(`Playlist no encontrada`);
    }

    // 4. Check if already saved
    const existingEntry = await this.userSavedPlaylistRepository.findOne({
      where: { user_id: userId, playlist_id: playlist.id }
    });

    if (existingEntry) {
      throw new ConflictException('Playlist ya guardada');
    }

    // 5. Create new entry
    const newEntry = this.userSavedPlaylistRepository.create({
      id: uuidv4(),
      user_id: userId,
      playlist_id: playlist.id
    });

    return this.userSavedPlaylistRepository.save(newEntry);
  }

  async isPlaylistSaved(userId: string, playlistId: string): Promise<boolean> {
    const count = await this.userSavedPlaylistRepository.count({
      where: { user_id: userId, playlist_id: playlistId },
    });
    return count > 0;
  }

  async getSavedPlaylists(userId: string): Promise<Playlist[]> {
    this.logger.debug(`[getSavedPlaylists] Fetching saved playlists for userId: ${userId}`);

    // 1. Find all user_saved_playlist entries for the given user
    const savedEntries = await this.userSavedPlaylistRepository.find({
      where: { user_id: userId },
      // NO 'relations' property here anymore, because the ORM relationship is gone
    });

    if (savedEntries.length === 0) {
      this.logger.debug(`[getSavedPlaylists] No saved playlists found for user ${userId}.`);
      return [];
    }

    // 2. Extract all playlist IDs (UUIDs) from the saved entries
    const playlistUuids = savedEntries.map(entry => entry.playlist_id);
    this.logger.debug(`[getSavedPlaylists] Found ${playlistUuids.length} saved playlist UUIDs for user ${userId}.`);

    // 3. Fetch the actual Playlist entities using these UUIDs
    // Use `In` operator to find multiple playlists by their IDs
    const playlists = await this.playlistRepository.find({
      where: {
        id: In(playlistUuids),
      },
      // Include any relations you need on the Playlist itself, e.g., songs, comments, etc.
      // relations: ['songs', 'comments'], // Example: if Playlist has relations
    });

    this.logger.debug(`[getSavedPlaylists] Successfully fetched ${playlists.length} actual playlists.`);
    return playlists;
  }

  async deleteSavedPlaylist(userId: string, playlistId: string): Promise<boolean> {
    const result = await this.userSavedPlaylistRepository.delete({ user_id: userId, playlist_id: playlistId });
    // --- CORRECCIÓN AQUÍ ---
    return (result.affected ?? 0) > 0;
    // ----------------------
  }

  async removeSavedPlaylist(userId: string, playlistIdentifier: string): Promise<void> {
    this.logger.debug(`[removeSavedPlaylist] Attempting to remove saved playlist. userId: ${userId}, playlistIdentifier: ${playlistIdentifier}`);

    // First, resolve the actual playlist ID (UUID) from the identifier
    let playlistToRemove: Playlist | null = null;
    if (uuidValidate(playlistIdentifier)) {
      playlistToRemove = await this.playlistRepository.findOne({ where: { id: playlistIdentifier } });
    } else {
      playlistToRemove = await this.playlistRepository.findOne({ where: { name: playlistIdentifier } });
    }

    if (!playlistToRemove) {
      this.logger.error(`[removeSavedPlaylist] Playlist identified by "${playlistIdentifier}" not found to remove.`);
      throw new NotFoundException(`Playlist identified by "${playlistIdentifier}" not found.`);
    }

    // Find the saved entry using the user ID and the actual playlist UUID
    const result = await this.userSavedPlaylistRepository.delete({
      user_id: userId,
      playlist_id: playlistToRemove.id, // Use the actual UUID here
    });

    if (result.affected === 0) {
      this.logger.warn(`[removeSavedPlaylist] No saved playlist entry found for user ${userId} and playlist ${playlistToRemove.id}.`);
      throw new NotFoundException('La playlist no está guardada por este usuario.');
    }

    this.logger.log(`[removeSavedPlaylist] Successfully removed playlist ${playlistToRemove.id} for user ${userId}.`);
  }
}