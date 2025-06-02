import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistsService.create(createPlaylistDto);
  }

  @Get()
  findAll() {
    return this.playlistsService.findAll();
  }

  // Nuevo endpoint para obtener playlists por userId
  @Get('user/:userId') // Endpoint: /playlists/user/:userId
  findUserPlaylists(@Param('userId') userId: string) {
    return this.playlistsService.findAllPlaylistsByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto
  ) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  @Get('by-name/:name')
  async findByName(@Param('name') name: string): Promise<Playlist | null> {
    const decodedName = decodeURIComponent(name);
    return this.playlistsService.findByName(decodedName);
  }
}