import { Controller, Get, Post, Body, Param, Put, Delete,UseGuards } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { AuthGuard } from '../auth/auth.guard';
@Controller('songs')
export class SongsController {
  
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }

  @Get()
  findAll() {
    return this.songsService.findAll();
  }

  @Get(':trackId')
  findOne(@Param('trackId') trackId: number) {
    return this.songsService.findOne(+trackId);
  }

  @Put(':trackId')
  update(
    @Param('trackId') trackId: number,
    @Body() updateSongDto: UpdateSongDto
  ) {
    return this.songsService.update(+trackId, updateSongDto);
  }

  @Delete(':trackId')
  remove(@Param('trackId') trackId: number) {
    return this.songsService.remove(+trackId);
  }
}