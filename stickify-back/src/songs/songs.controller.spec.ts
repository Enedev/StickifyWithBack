import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

const mockSong1 = {
  trackId: 1,
  artistName: 'Artist 1',
  trackName: 'Song 1',
  primaryGenreName: 'Pop',
  collectionName: 'Album 1',
  artworkUrl100: 'url1',
  releaseDate: '2020-01-01',
  isUserUpload: false,
  collectionId: 101,
  artistId: 201,
};
const mockSong2 = {
  trackId: 2,
  artistName: 'Artist 2',
  trackName: 'Song 2',
  primaryGenreName: 'Rock',
  collectionName: 'Album 2',
  artworkUrl100: 'url2',
  releaseDate: '2021-02-02',
  isUserUpload: true,
  collectionId: 102,
  artistId: 202,
};
const mockSong3 = {
  trackId: 3,
  artistName: 'Artist 3',
  trackName: 'Song 3',
  primaryGenreName: 'Jazz',
  collectionName: 'Album 3',
  artworkUrl100: 'url3',
  releaseDate: '2022-03-03',
  isUserUpload: false,
  collectionId: 103,
  artistId: 203,
};

describe('SongsController', () => {
  let controller: SongsController;
  let service: jest.Mocked<SongsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [
        {
          provide: SongsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            createBatch: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<SongsController>(SongsController);
    service = module.get(SongsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a song (3 times)', async () => {
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        service.create.mockResolvedValueOnce(song);
        expect(await controller.create(song as CreateSongDto)).toEqual(song);
      }
    });
    it('should throw ConflictException', async () => {
      service.create.mockRejectedValue(new ConflictException());
      await expect(controller.create(mockSong1 as CreateSongDto)).rejects.toBeInstanceOf(ConflictException);
    });
    it('should throw InternalServerErrorException', async () => {
      service.create.mockRejectedValue(new Error('fail'));
      await expect(controller.create(mockSong1 as CreateSongDto)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all songs (3 times)', async () => {
      for (const arr of [
        [mockSong1],
        [mockSong2],
        [mockSong1, mockSong2, mockSong3],
      ]) {
        service.findAll.mockResolvedValueOnce(arr);
        expect(await controller.findAll()).toEqual(arr);
      }
    });
    it('should filter by isUserUpload', async () => {
      service.findAll.mockResolvedValue([mockSong2]);
      expect(await controller.findAll('true')).toEqual([mockSong2]);
      expect(service.findAll).toHaveBeenCalledWith({ isUserUpload: true });
    });
    it('should throw InternalServerErrorException', async () => {
      service.findAll.mockRejectedValue(new Error('fail'));
      await expect(controller.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a song by id (3 times)', async () => {
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        service.findOne.mockResolvedValueOnce(song);
        expect(await controller.findOne(song.trackId)).toEqual(song);
      }
    });
  });

  describe('createBatch', () => {
    it('should create songs in batch (3 times)', async () => {
      for (const arr of [
        [mockSong1],
        [mockSong2],
        [mockSong1, mockSong2, mockSong3],
      ]) {
        service.createBatch.mockResolvedValueOnce(arr);
        const body = { songs: arr };
        expect(await controller.createBatch(body)).toEqual({
          success: true,
          message: 'Songs batch processed successfully',
          data: arr,
        });
      }
    });
    it('should handle errors in batch', async () => {
      service.createBatch.mockRejectedValue(new Error('fail'));
      const body = { songs: [mockSong1, mockSong2, mockSong3] };
      const result = await controller.createBatch(body);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Error processing batch');
    });
  });

  describe('update', () => {
    it('should update a song (3 times)', async () => {
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        service.update.mockResolvedValueOnce(song);
        expect(await controller.update(song.trackId, { trackName: 'Updated' } as UpdateSongDto)).toEqual(song);
      }
    });
  });

  describe('remove', () => {
    it('should remove a song (3 times)', async () => {
      service.remove.mockResolvedValue(undefined);
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        await expect(controller.remove(song.trackId)).resolves.toBeUndefined();
        expect(service.remove).toHaveBeenCalledWith(song.trackId);
      }
    });
  });
});
