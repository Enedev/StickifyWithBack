import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from './entities/song.entity';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private songsRepository: Repository<Song>,
  ) {}

  create(createSongDto: CreateSongDto): Promise<Song> {
    const song = this.songsRepository.create(createSongDto);
    return this.songsRepository.save(song);
  }

  findAll(): Promise<Song[]> {
    return this.songsRepository.find();
  }

  findOne(trackId: number): Promise<Song | null> {
    return this.songsRepository.findOne({ where: { trackId } });
  }

  update(trackId: number, updateSongDto: UpdateSongDto): Promise<Song> {
    return this.songsRepository.save({ trackId, ...updateSongDto });
  }

  async remove(trackId: number): Promise<void> {
    await this.songsRepository.delete(trackId);
  }
}