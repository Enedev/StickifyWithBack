import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  findOne(id: string): Promise<Playlist| null> {
    return this.playlistsRepository.findOne({ where: { id } });
  }

  update(id: string, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
    return this.playlistsRepository.save({ id, ...updatePlaylistDto });
  }

  async remove(id: string): Promise<void> {
    await this.playlistsRepository.delete(id);
  }
}