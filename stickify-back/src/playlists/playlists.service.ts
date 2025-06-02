import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistsRepository: Repository<Playlist>,
  ) {}

  create(createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const playlist = this.playlistsRepository.create(createPlaylistDto);
    return this.playlistsRepository.save(playlist);
  }

  findAll(): Promise<Playlist[]> {
    return this.playlistsRepository.find();
  }

  // Nuevo método para encontrar playlists por usuario
  findAllPlaylistsByUserId(userId: string): Promise<Playlist[]> {
    return this.playlistsRepository.find({ where: { createdBy: userId } });
  }


  findOne(id: string): Promise<Playlist| null> {
    return this.playlistsRepository.findOne({ where: { id } });
  }

  update(id: string, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
    return this.playlistsRepository.save({ id, ...updatePlaylistDto });
  }

  async remove(id: string): Promise<void> {
    await this.playlistsRepository.delete(id);
  }
  async findByName(name: string): Promise<Playlist | null> {
    return this.playlistsRepository.findOne({ 
      where: { 
        name: Like(`%${name}%`) // Búsqueda insensible a mayúsculas/minúsculas y parcial
      } 
    });
  }

  
}