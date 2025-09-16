// src/playlists/playlists.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsModule } from './playlists.module';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from './entities/playlist.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PlaylistsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PlaylistsModule],
    })
      .overrideProvider(getRepositoryToken(Playlist))
      .useValue({}) // mock del repositorio Playlist
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PlaylistsService', () => {
    const service = module.get<PlaylistsService>(PlaylistsService);
    expect(service).toBeDefined();
  });

  it('should register PlaylistsController', () => {
    const controller = module.get<PlaylistsController>(PlaylistsController);
    expect(controller).toBeDefined();
  });
});
