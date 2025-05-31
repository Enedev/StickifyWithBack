import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from './entities/song.entity';
import { CreateSongDto } from './dto/create-song.dto'; // Import your DTO

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private songsRepository: Repository<Song>,
  ) {}

  async create(createSongDto: CreateSongDto): Promise<Song | null> { // Use CreateSongDto here
    try {
      const song = this.songsRepository.create(createSongDto);
      return await this.songsRepository.save(song);
    } catch (error: any) { // Type 'error' as 'any' or 'unknown' and handle
      if (error.code === '23505') { // PostgreSQL unique violation error code
        console.warn(`Song with trackId ${createSongDto.trackId} already exists. Returning existing song.`);
        return this.songsRepository.findOne({ where: { trackId: createSongDto.trackId } });
      }
      console.error('Error creating song:', error); // Log other errors
      throw error; // Re-throw other errors
    }
  }

  async createBatch(songs: CreateSongDto[]): Promise<Song[]> { // Accept CreateSongDto[]
    const creationPromises = songs.map(songDto => this.create(songDto));
    const results = await Promise.allSettled(creationPromises);

    const createdSongs: Song[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value !== null) {
        createdSongs.push(result.value);
      } else if (result.status === 'rejected') {
        console.error('Failed to create a song in batch:', result.reason);
        // Optionally, you might want to log the specific song that failed
      }
    });

    return createdSongs;
  }

  findAll(filter: any = {}): Promise<Song[]> {
    return this.songsRepository.find({ where: filter });
  }

  findOne(trackId: number): Promise<Song | null> {
    return this.songsRepository.findOne({ where: { trackId } });
  }

  async update(trackId: number, updateSongDto: any): Promise<Song | null> {
    const updateResult = await this.songsRepository.update(trackId, updateSongDto);
    // Check if any row was affected to confirm update
    if (updateResult.affected && updateResult.affected > 0) {
      return this.songsRepository.findOne({ where: { trackId } });
    }
    return null; // Return null if no song was found and updated
  }

  async remove(trackId: number): Promise<void> {
    await this.songsRepository.delete(trackId);
  }
}