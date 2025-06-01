import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { SongsModule } from './songs/songs.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './song-ratings/song-ratings.module';
import { UserCommentsModule } from './user-comments/user-comments.module';
import { User } from './user/entities/user.entity';
import { Song } from './songs/entities/song.entity';
import { Playlist } from './playlists/entities/playlist.entity';
import { Comment } from './comments/entities/comment.entity';
import { SongRating } from './song-ratings/entities/song-rating.entity';
import { UserComment } from './user-comments/entities/user-comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.SUPABASE_HOST,
      port: 6543,
      username: 'postgres.txsacbfleedgdjofxowq',
      password: process.env.SUPABASE_PASSWORD,
      database: 'postgres',
      entities: [
        User, 
        Song, 
        Playlist, 
        Comment, 
        SongRating,
        UserComment
      ],
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    AuthModule,
    UsersModule,
    SongsModule,
    PlaylistsModule,
    CommentsModule,
    RatingsModule,
    UserCommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}