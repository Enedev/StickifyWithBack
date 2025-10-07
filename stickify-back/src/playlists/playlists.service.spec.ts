import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsService } from './playlists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { Repository } from 'typeorm';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

describe('PlaylistsService', () => {
  let playlistsService: PlaylistsService;
  let playlistRepository: Repository<Playlist>;
  //Mock de playlist
  const mockPlaylist: Playlist = {
    id: 'playlist-123',
    name: 'My Playlist',
    trackIds: ['track1', 'track2'],
    cover: 'cover.jpg',
    type: 'user',
    createdBy: 'user-456',
    createdAt: new Date('2025-08-25T19:00:00Z'),
  };
  //Mock del repositorio, reemplaza métodos con jest
  const mockPlaylistRepository = {
    create: jest.fn().mockReturnValue(mockPlaylist),
    save: jest.fn().mockResolvedValue(mockPlaylist),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        {
          provide: getRepositoryToken(Playlist),
          useValue: mockPlaylistRepository,
        },
      ],
    }).compile();

    playlistsService = module.get<PlaylistsService>(PlaylistsService);
    playlistRepository = module.get<Repository<Playlist>>(getRepositoryToken(Playlist));
  });

  it('should create and save a playlist', async () => {
    //Arrange
    const createDto: CreatePlaylistDto = {
      id: 'playlist-123',
      name: 'My Playlist',
      trackIds: ['track1', 'track2'],
      cover: 'cover.jpg',
      type: 'user',
      createdBy: 'user-456',
      createdAt: '2025-08-25T19:00:00Z',
    };
    //Act
    const result = await playlistsService.create(createDto);
    //Assert
    expect(mockPlaylistRepository.create).toHaveBeenCalledWith(createDto);
    expect(mockPlaylistRepository.save).toHaveBeenCalledWith(mockPlaylist);
    expect(result).toEqual(mockPlaylist);
  });
});
