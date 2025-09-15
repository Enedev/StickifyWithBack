import { Test, TestingModule } from '@nestjs/testing';
import { UserSavedPlaylistsController } from './user_saved_playlists.controller';
import { UserSavedPlaylistsService } from './user_saved_playlists.service';

const mockUser1 = {
  id: 'user1@mail.com',
  name: 'User 1',
  email: 'user1@mail.com',
  password: 'pass',
  username: 'user1',
  premium: false,
  followers: [],
  following: [],
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
};
const mockUser2 = {
  id: 'user2@mail.com',
  name: 'User 2',
  email: 'user2@mail.com',
  password: 'pass',
  username: 'user2',
  premium: true,
  followers: [],
  following: [],
  createdAt: new Date('2023-01-02T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
};
const mockUser3 = {
  id: 'user3@mail.com',
  name: 'User 3',
  email: 'user3@mail.com',
  password: 'pass',
  username: 'user3',
  premium: false,
  followers: [],
  following: [],
  createdAt: new Date('2023-01-03T00:00:00Z'),
  updatedAt: new Date('2023-01-03T00:00:00Z'),
};

const mockPlaylist1 = {
  id: 'p1',
  name: 'Playlist 1',
  trackIds: ['t1', 't2'],
  type: 'user' as 'user',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
  user: mockUser1,
};
const mockPlaylist2 = {
  id: 'p2',
  name: 'Playlist 2',
  trackIds: ['t3'],
  type: 'user' as 'user',
  createdAt: new Date('2023-01-02T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
  user: mockUser2,
};
const mockPlaylist3 = {
  id: 'auto-123',
  name: 'auto-123',
  trackIds: [],
  type: 'auto' as 'auto',
  createdAt: new Date('2023-01-03T00:00:00Z'),
  updatedAt: new Date('2023-01-03T00:00:00Z'),
  user: mockUser3,
};

const mockSaved1 = {
  id: 's1',
  user_id: 'user1@mail.com',
  playlist_id: 'p1',
  saved_at: new Date('2023-01-01T00:00:00Z'),
  user: mockUser1,
  playlist: mockPlaylist1,
};
const mockSaved2 = {
  id: 's2',
  user_id: 'user2@mail.com',
  playlist_id: 'p2',
  saved_at: new Date('2023-01-02T00:00:00Z'),
  user: mockUser2,
  playlist: mockPlaylist2,
};
const mockSaved3 = {
  id: 's3',
  user_id: 'user3@mail.com',
  playlist_id: 'auto-123',
  saved_at: new Date('2023-01-03T00:00:00Z'),
  user: mockUser3,
  playlist: mockPlaylist3,
};

describe('UserSavedPlaylistsController', () => {
  let controller: UserSavedPlaylistsController;
  let service: jest.Mocked<UserSavedPlaylistsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSavedPlaylistsController],
      providers: [
        {
          provide: UserSavedPlaylistsService,
          useValue: {
            savePlaylist: jest.fn(),
            isPlaylistSaved: jest.fn(),
            getSavedPlaylists: jest.fn(),
            deleteSavedPlaylist: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<UserSavedPlaylistsController>(UserSavedPlaylistsController);
    service = module.get(UserSavedPlaylistsService);
    jest.clearAllMocks();
  });

  describe('savePlaylist', () => {
    it('should save playlist (3 times)', async () => {
      for (const saved of [mockSaved1, mockSaved2, mockSaved3]) {
        service.savePlaylist.mockResolvedValueOnce(saved);
        expect(await controller.savePlaylist({ userId: saved.user_id, playlistId: saved.playlist_id })).toEqual(saved);
      }
    });
  });

  describe('isPlaylistSaved', () => {
    it('should check if playlist is saved (3 times)', async () => {
      service.isPlaylistSaved.mockResolvedValueOnce(true);
      expect(await controller.isPlaylistSaved('user1@mail.com', 'p1')).toBe(true);
      service.isPlaylistSaved.mockResolvedValueOnce(false);
      expect(await controller.isPlaylistSaved('user2@mail.com', 'p2')).toBe(false);
      service.isPlaylistSaved.mockResolvedValueOnce(true);
      expect(await controller.isPlaylistSaved('user3@mail.com', 'auto-123')).toBe(true);
    });
  });

  describe('getSavedPlaylists', () => {
    it('should get saved playlists (3 times)', async () => {
      const arr1 = [mockPlaylist1];
      const arr2 = [mockPlaylist2];
      const arr3 = [mockPlaylist1, mockPlaylist2, mockPlaylist3];
      for (const arr of [arr1, arr2, arr3]) {
        service.getSavedPlaylists.mockResolvedValueOnce(arr);
        expect(await controller.getSavedPlaylists(arr[0].id)).toEqual(arr);
      }
    });
  });

  describe('deleteSavedPlaylist', () => {
    it('should delete saved playlist (3 times)', async () => {
      service.deleteSavedPlaylist.mockResolvedValueOnce(true);
      await expect(controller.deleteSavedPlaylist(mockSaved1.user_id, mockSaved1.playlist_id)).resolves.toBeUndefined();
      expect(service.deleteSavedPlaylist).toHaveBeenCalledWith(mockSaved1.user_id, mockSaved1.playlist_id);

      service.deleteSavedPlaylist.mockResolvedValueOnce(false);
      await expect(controller.deleteSavedPlaylist(mockSaved2.user_id, mockSaved2.playlist_id)).resolves.toBeUndefined();
      expect(service.deleteSavedPlaylist).toHaveBeenCalledWith(mockSaved2.user_id, mockSaved2.playlist_id);

      service.deleteSavedPlaylist.mockResolvedValueOnce(true);
      await expect(controller.deleteSavedPlaylist(mockSaved3.user_id, mockSaved3.playlist_id)).resolves.toBeUndefined();
      expect(service.deleteSavedPlaylist).toHaveBeenCalledWith(mockSaved3.user_id, mockSaved3.playlist_id);
    });
  });
});
