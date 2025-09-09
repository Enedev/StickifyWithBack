import { Controller, Get, Post, Body, Param, Put, Delete, Query, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Song } from './entities/song.entity';

@Controller('songs')
export class SongsController {
  
  constructor(private readonly songsService: SongsService) {}

  @Post()
  async create(@Body() createSongDto: CreateSongDto): Promise<Song | null> {
    try {
      return await this.songsService.create(createSongDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating song:', error);
      throw new InternalServerErrorException('Failed to create song');
    }
  }

  @Get()
  async findAll(@Query('isUserUpload') isUserUpload?: string): Promise<Song[]> {
    try {
      const filter = isUserUpload ? { isUserUpload: isUserUpload === 'true' } : {};
      return await this.songsService.findAll(filter); // Now sorting is handled internally
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw new InternalServerErrorException('Failed to fetch songs');
    }
  }
  
  @Get(':trackId')
  findOne(@Param('trackId') trackId: number): Promise<Song | null> {
    return this.songsService.findOne(+trackId);
  }

  @Post('batch') // Esto crea la ruta POST /api/songs/batch
  async createBatch(@Body() body: { songs: CreateSongDto[] }): Promise<any> {
    try {
      const result = await this.songsService.createBatch(body.songs);
      return {
        success: true,
        message: 'Songs batch processed successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error processing batch',
        error: error.message
      };
    }
  }

  @Put(':trackId')
  update(
    @Param('trackId') trackId: number,
    @Body() updateSongDto: UpdateSongDto
  ): Promise<Song | null> {
    return this.songsService.update(+trackId, updateSongDto);
  }

  @Delete(':trackId')
  remove(@Param('trackId') trackId: number): Promise<void> {
    return this.songsService.remove(+trackId);
  }
}