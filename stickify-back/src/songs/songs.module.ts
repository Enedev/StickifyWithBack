import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { Song } from './entities/song.entity';
import { AuthModule } from '../auth/auth.module'; // ¡IMPORTA EL AUTHMODULE AQUÍ!
@Module({
  imports: [TypeOrmModule.forFeature([Song]), AuthModule],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}