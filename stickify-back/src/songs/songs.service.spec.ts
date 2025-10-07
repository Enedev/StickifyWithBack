import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';

//Mocks de canciones
const mockSong1: Song = {
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
const mockSong2: Song = {
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
const mockSong3: Song = {
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

describe('SongsService', () => {
  let service: SongsService;
  let repo: jest.Mocked<Repository<Song>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          //Mock del repositorio TypeORM
          provide: getRepositoryToken(Song),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<SongsService>(SongsService);
    repo = module.get(getRepositoryToken(Song));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a song (3 times)', async () => {
      //Arrange para probar los 3 mocks
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        repo.create.mockReturnValue(song);
        repo.save.mockResolvedValue(song);
        //Assert
        expect(await service.create(song)).toEqual(song);
      }
    });
    it('should return existing song if unique violation (3 times)', async () => {
      //Arrange para probar los 3 mocks
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        repo.create.mockReturnValue(song);
        const error: any = { code: '23505' };
        repo.save.mockRejectedValue(error);
        repo.findOne.mockResolvedValue(song);
        //Assert
        expect(await service.create(song)).toEqual(song);
      }
    });
    it('should throw error for other exceptions (3 times)', async () => {
      //Arrange para probar los 3 mocks
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        repo.create.mockReturnValue(song);
        const error: any = { code: 'OTHER', message: 'fail' };
        repo.save.mockRejectedValue(error);
        //Assert
        await expect(service.create(song)).rejects.toEqual(error);
      }
    });
  });

  describe('createBatch', () => {
    it('should create all songs in batch', async () => {
      //Arrange simula que create funcione para todas las canciones
      jest.spyOn(service, 'create').mockImplementation(song => Promise.resolve(song));
      //Act
      const result = await service.createBatch([mockSong1, mockSong2, mockSong3]);
      //Assert
      expect(result).toEqual([mockSong1, mockSong2, mockSong3]);
    });
    it('should handle partial failures in batch', async () => {
      //Arrange simula que create falle para la segunda canción
      jest.spyOn(service, 'create')
        .mockResolvedValueOnce(mockSong1)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(mockSong3);
      //Act
      const result = await service.createBatch([mockSong1, mockSong2, mockSong3]);
      //Assert
      expect(result).toEqual([mockSong1, mockSong3]);
    });
    it('should return empty array if all fail', async () => {
      //Arrange simula que create falle para todas las canciones
      jest.spyOn(service, 'create').mockRejectedValue(new Error('fail'));
      //Act
      const result = await service.createBatch([mockSong1, mockSong2, mockSong3]);
      //Assert
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all songs (3 times)', async () => {
      //Arrange para probar los 3 mocks
      for (const arr of [
        [mockSong1],
        [mockSong2],
        [mockSong1, mockSong2, mockSong3],
      ]) {
        repo.find.mockResolvedValue(arr);
        //Assert
        expect(await service.findAll()).toEqual(arr);
      }
    });
  });

  describe('findOne', () => {
    it('should return a song by trackId (3 times)', async () => {
      //Arrange para probar los 3 mocks
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        repo.findOne.mockResolvedValue(song);
        //Assert
        expect(await service.findOne(song.trackId)).toEqual(song);
      }
    });
  });

  describe('update', () => {
    it('should update a song and return it (3 times)', async () => {
      //Arrange para probar los 3 mocks
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
        repo.findOne.mockResolvedValue(song);
        //Assert
        expect(await service.update(song.trackId, { trackName: 'Updated' })).toEqual(song);
      }
    });
    it('should return null if not found (3 times)', async () => {
      //Arrange para probar los 3 mocks 
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        repo.update.mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });
        //Assert
        expect(await service.update(song.trackId, { trackName: 'Updated' })).toBeNull();
      }
    });
  });

  describe('remove', () => {
    it('should call delete 3 times', async () => {
      //Arrange simula un resultado exitoso de delete
      const deleteResult = { raw: {}, affected: 1 };
      repo.delete.mockResolvedValue(deleteResult);
      for (const song of [mockSong1, mockSong2, mockSong3]) {
        //Assert
        await expect(service.remove(song.trackId)).resolves.toBeUndefined();
        expect(repo.delete).toHaveBeenCalledWith(song.trackId);
      }
    });
  });
});