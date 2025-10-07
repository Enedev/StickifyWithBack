import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';

describe('PlaylistsController', () => {
  let controller: PlaylistsController;
  let service: jest.Mocked<PlaylistsService>;
  //Mock de playlists  
  const mockPlaylist1: Playlist = {
    id: '1',
    name: 'Playlist 1',
    trackIds: ['song1', 'song2'],
    type: 'user',
    createdAt: new Date('2023-07-01T00:00:00Z'),
    createdBy: 'user1',
  };
  const mockPlaylist2: Playlist = {
    id: '2',
    name: 'Playlist 2',
    trackIds: ['song3'],
    type: 'user',
    createdAt: new Date('2023-07-02T00:00:00Z'),
    createdBy: 'user2',
  };
  const mockPlaylist3: Playlist = {
    id: '3',
    name: 'Playlist 3',
    trackIds: [],
    type: 'auto',
    createdAt: new Date('2023-07-03T00:00:00Z'),
    createdBy: 'user3',
  };

  beforeEach(async () => {
    //Arrange crea un modulo de prueba e inyecta el mock del servicio de playlists
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        {
          provide: PlaylistsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllPlaylistsByUserId: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByName: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<PlaylistsController>(PlaylistsController);
    service = module.get(PlaylistsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a playlist (3 times)', async () => {
      for (const playlist of [mockPlaylist1, mockPlaylist2, mockPlaylist3]) {
        //Mock
        service.create.mockResolvedValueOnce(playlist);
        //Arrange dto de creación
        const dto: CreatePlaylistDto = {
          id: playlist.id,
          name: playlist.name,
          trackIds: playlist.trackIds,
          type: playlist.type,
          createdBy: playlist.createdBy,
          createdAt: playlist.createdAt.toISOString(),
        };
        //Assert
        expect(await controller.create(dto)).toEqual(playlist);
      }
    });
  });

  describe('findAll', () => {
    it('should return all playlists (3 times)', async () => {
      for (const arr of [
        [mockPlaylist1],
        [mockPlaylist2],
        [mockPlaylist1, mockPlaylist2, mockPlaylist3],
      ]) {
        //Mock
        service.findAll.mockResolvedValueOnce(arr);
        //Assert
        expect(await controller.findAll()).toEqual(arr);
      }
    });
  });

  describe('findUserPlaylists', () => {
    it('should return playlists by user (3 times)', async () => {
      for (const arr of [
        [mockPlaylist1],
        [mockPlaylist2],
        [mockPlaylist1, mockPlaylist2, mockPlaylist3],
      ]) {
        //Mock
        service.findAllPlaylistsByUserId.mockResolvedValueOnce(arr);
        //Assert
        expect(await controller.findUserPlaylists(arr[0].createdBy!)).toEqual(arr);
      }
    });
  });

  describe('findOne', () => {
    it('should return a playlist by id (3 times)', async () => {
      for (const playlist of [mockPlaylist1, mockPlaylist2, mockPlaylist3]) {
        //Mock
        service.findOne.mockResolvedValueOnce(playlist);
        //Assert
        expect(await controller.findOne(playlist.id)).toEqual(playlist);
      }
    });
  });

  describe('update', () => {
    it('should update a playlist (3 times)', async () => {
      for (const playlist of [mockPlaylist1, mockPlaylist2, mockPlaylist3]) {
        //Mock
        service.update.mockResolvedValueOnce(playlist);
        //Assert
        expect(await controller.update(playlist.id, { name: 'Actualizada' } as UpdatePlaylistDto)).toEqual(playlist);
      }
    });
  });

  describe('remove', () => {
    it('should remove a playlist (3 times)', async () => {
      //Mock
      service.remove.mockResolvedValue(undefined);
      for (const playlist of [mockPlaylist1, mockPlaylist2, mockPlaylist3]) {
        //Assert
        await expect(controller.remove(playlist.id)).resolves.toBeUndefined();
        expect(service.remove).toHaveBeenCalledWith(playlist.id);
      }
    });
  });

  describe('findByName', () => {
    it('should find playlist by name (3 times)', async () => {
      for (const playlist of [mockPlaylist1, mockPlaylist2, mockPlaylist3]) {
        //Mock
        service.findByName.mockResolvedValueOnce(playlist);
        //Assert
        expect(await controller.findByName(encodeURIComponent(playlist.name))).toEqual(playlist);
      }
    });
  });
});
