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
    //Arrange crea un modulo de prueba e importa PlaylistsModule
    module = await Test.createTestingModule({
      imports: [PlaylistsModule],
    })
      .overrideProvider(getRepositoryToken(Playlist))
      .useValue({}) // mock del repositorio Playlist
      .compile();
  });

  it('should be defined', () => {
    //Assert verifica que el modulo esté definido
    expect(module).toBeDefined();
  });

  it('should provide PlaylistsService', () => {
    //Act
    const service = module.get<PlaylistsService>(PlaylistsService);
    //Assert
    expect(service).toBeDefined();
  });

  it('should register PlaylistsController', () => {
    //Act
    const controller = module.get<PlaylistsController>(PlaylistsController);
    //Assert
    expect(controller).toBeDefined();
  });
});
