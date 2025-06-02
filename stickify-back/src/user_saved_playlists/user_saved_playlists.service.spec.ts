import { Test, TestingModule } from '@nestjs/testing';
import { UserSavedPlaylistsService } from './user_saved_playlists.service';

describe('UserSavedPlaylistsService', () => {
  let service: UserSavedPlaylistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSavedPlaylistsService],
    }).compile();

    service = module.get<UserSavedPlaylistsService>(UserSavedPlaylistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
