import { Test, TestingModule } from '@nestjs/testing';
import { UserSavedPlaylistsController } from './user_saved_playlists.controller';
import { UserSavedPlaylistsService } from './user_saved_playlists.service';

describe('UserSavedPlaylistsController', () => {
  let controller: UserSavedPlaylistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSavedPlaylistsController],
      providers: [UserSavedPlaylistsService],
    }).compile();

    controller = module.get<UserSavedPlaylistsController>(UserSavedPlaylistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
