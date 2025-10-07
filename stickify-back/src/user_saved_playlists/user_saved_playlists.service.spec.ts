import { Test, TestingModule } from '@nestjs/testing';
import { UserSavedPlaylistsService } from './user_saved_playlists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserSavedPlaylist } from './entities/user_saved_playlist.entity';
import { Playlist } from '../playlists/entities/playlist.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

//Mocks de usuarios
const mockUser1: User = { id: 'u1', email: 'user1@mail.com', username: 'user1', password: '', premium: false, followers: [], following: [] };
const mockUser2: User = { id: 'u2', email: 'user2@mail.com', username: 'user2', password: '', premium: false, followers: [], following: [] };
const mockUser3: User = { id: 'u3', email: 'user3@mail.com', username: 'user3', password: '', premium: false, followers: [], following: [] };

//Mocks de playlists
const mockPlaylist1: Playlist = { id: 'p1', name: 'Playlist 1', trackIds: [], type: 'user', createdAt: new Date(), createdBy: 'user1' } as any;
const mockPlaylist2: Playlist = { id: 'p2', name: 'Playlist 2', trackIds: [], type: 'user', createdAt: new Date(), createdBy: 'user2' } as any;
const mockPlaylist3: Playlist = { id: 'auto-123', name: 'auto-123', trackIds: [], type: 'auto', createdAt: new Date(), createdBy: 'automatic' } as any;

//Mocks de playlists guardadas por usuarios
const mockSaved1: UserSavedPlaylist = { id: 's1', user_id: 'user1@mail.com', playlist_id: 'p1' } as any;
const mockSaved2: UserSavedPlaylist = { id: 's2', user_id: 'user2@mail.com', playlist_id: 'p2' } as any;
const mockSaved3: UserSavedPlaylist = { id: 's3', user_id: 'user3@mail.com', playlist_id: 'auto-123' } as any;

describe('UserSavedPlaylistsService', () => {
  let service: UserSavedPlaylistsService;
  let uspRepo: jest.Mocked<Repository<UserSavedPlaylist>>;
  let playlistRepo: jest.Mocked<Repository<Playlist>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSavedPlaylistsService,
        //Mock de los repositorios TypeORM
        { provide: getRepositoryToken(UserSavedPlaylist), useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn(), count: jest.fn(), delete: jest.fn() } },
        //Mock del repositorio de Playlist
        { provide: getRepositoryToken(Playlist), useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() } },
        //Mock del repositorio de User
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
      ],
    }).compile();
    service = module.get(UserSavedPlaylistsService);
    uspRepo = module.get(getRepositoryToken(UserSavedPlaylist));
    playlistRepo = module.get(getRepositoryToken(Playlist));
    userRepo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('savePlaylist', () => {
    it('should save playlist for user (3 cases)', async () => {
      // Caso 1: usuario y playlist existen
      //Arrange
      userRepo.findOne.mockResolvedValueOnce(mockUser1);
      playlistRepo.findOne.mockResolvedValueOnce(mockPlaylist1);
      uspRepo.findOne.mockResolvedValueOnce(null);
      uspRepo.create.mockReturnValue(mockSaved1);
      uspRepo.save.mockResolvedValueOnce(mockSaved1);
      //Assert
      expect(await service.savePlaylist(mockUser1.email, mockPlaylist1.id)).toEqual(mockSaved1);
      // Caso 2: playlist auto se crea
      //Arrange
      userRepo.findOne.mockResolvedValueOnce(mockUser3);
      playlistRepo.findOne.mockResolvedValueOnce(null);
      playlistRepo.create.mockReturnValue(mockPlaylist3);
      playlistRepo.save.mockResolvedValueOnce(mockPlaylist3);
      uspRepo.findOne.mockResolvedValueOnce(null);
      uspRepo.create.mockReturnValue(mockSaved3);
      uspRepo.save.mockResolvedValueOnce(mockSaved3);
      //Assert
      expect(await service.savePlaylist(mockUser3.email, mockPlaylist3.id)).toEqual(mockSaved3);
      // Caso 3: playlist ya guardada
      //Arrange
      userRepo.findOne.mockResolvedValueOnce(mockUser2);
      playlistRepo.findOne.mockResolvedValueOnce(mockPlaylist2);
      uspRepo.findOne.mockResolvedValueOnce(mockSaved2);
      //Assert
      await expect(service.savePlaylist(mockUser2.email, mockPlaylist2.id)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('isPlaylistSaved', () => {
    it('should check if playlist is saved (3 cases)', async () => {
      //Act
      uspRepo.count.mockResolvedValueOnce(1);
      //Assert
      expect(await service.isPlaylistSaved('user1@mail.com', 'p1')).toBe(true);
      //Act
      uspRepo.count.mockResolvedValueOnce(0);
      //Assert
      expect(await service.isPlaylistSaved('user2@mail.com', 'p2')).toBe(false);
      //Act
      uspRepo.count.mockResolvedValueOnce(2);
      //Assert
      expect(await service.isPlaylistSaved('user3@mail.com', 'auto-123')).toBe(true);
    });
  });

  describe('getSavedPlaylists', () => {
    it('should get saved playlists for user (3 cases)', async () => {
      // Caso 1: tiene 1
      //Act
      uspRepo.find.mockResolvedValueOnce([mockSaved1]);
      playlistRepo.find.mockResolvedValueOnce([mockPlaylist1]);
      //Assert
      expect(await service.getSavedPlaylists('user1@mail.com')).toEqual([mockPlaylist1]);
      // Caso 2: tiene 2
      //Act
      uspRepo.find.mockResolvedValueOnce([mockSaved2, mockSaved3]);
      playlistRepo.find.mockResolvedValueOnce([mockPlaylist2, mockPlaylist3]);
      //Assert
      expect(await service.getSavedPlaylists('user2@mail.com')).toEqual([mockPlaylist2, mockPlaylist3]);
      // Caso 3: ninguno
      //Act
      uspRepo.find.mockResolvedValueOnce([]);
      //Assert
      expect(await service.getSavedPlaylists('user3@mail.com')).toEqual([]);
    });
  });

  describe('deleteSavedPlaylist', () => {
    it('should delete saved playlist (3 cases)', async () => {
      //Act
      uspRepo.delete.mockResolvedValueOnce({ affected: 1 } as any);
      //Assert
      expect(await service.deleteSavedPlaylist('user1@mail.com', 'p1')).toBe(true);
      //Act
      uspRepo.delete.mockResolvedValueOnce({ affected: 0 } as any);
      //Assert
      expect(await service.deleteSavedPlaylist('user2@mail.com', 'p2')).toBe(false);
      //Act
      uspRepo.delete.mockResolvedValueOnce({ affected: 2 } as any);
      //Assert
      expect(await service.deleteSavedPlaylist('user3@mail.com', 'auto-123')).toBe(true);
    });
  });

  describe('removeSavedPlaylist', () => {
    it('should remove saved playlist (3 cases)', async () => {
      // Caso 1: remueve correctamente por id
      //Act
      playlistRepo.findOne.mockResolvedValueOnce(mockPlaylist1);
      uspRepo.delete.mockResolvedValueOnce({ affected: 1 } as any);
      //Assert
      await expect(service.removeSavedPlaylist('user1@mail.com', mockPlaylist1.id)).resolves.toBeUndefined();
      // Caso 2: playlist no existe
      //Act
      playlistRepo.findOne.mockResolvedValueOnce(null);
      //Assert
      await expect(service.removeSavedPlaylist('user2@mail.com', 'no-existe')).rejects.toBeInstanceOf(NotFoundException);
      // Caso 3: no guardada
      //Act
      playlistRepo.findOne.mockResolvedValueOnce(mockPlaylist2);
      uspRepo.delete.mockResolvedValueOnce({ affected: 0 } as any);
      //Assert
      await expect(service.removeSavedPlaylist('user2@mail.com', mockPlaylist2.id)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
