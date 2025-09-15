import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const mockUser1: User = {
  id: '1',
  username: 'user1',
  email: 'user1@mail.com',
  password: 'pass1',
  premium: false,
  followers: [],
  following: [],
};
const mockUser2: User = {
  id: '2',
  username: 'user2',
  email: 'user2@mail.com',
  password: 'pass2',
  premium: true,
  followers: ['user1@mail.com'],
  following: [],
};
const mockUser3: User = {
  id: '3',
  username: 'user3',
  email: 'user3@mail.com',
  password: 'pass3',
  premium: false,
  followers: [],
  following: ['user1@mail.com'],
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            findByEmail: jest.fn(),
            remove: jest.fn(),
            toggleFollow: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        const result = { success: true, token: `${user.username}-token` };
        service.create.mockResolvedValueOnce(result);
        expect(await controller.create(user as CreateUserDto)).toEqual(result);
      }
    });
  });

  describe('findAll', () => {
    it('should return all users (3 times)', async () => {
      for (const arr of [
        [mockUser1],
        [mockUser2],
        [mockUser1, mockUser2, mockUser3],
      ]) {
        service.findAll.mockResolvedValueOnce(arr);
        expect(await controller.findAll()).toEqual(arr);
      }
    });
  });

  describe('findOne', () => {
    it('should return a user by id (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        service.findOne.mockResolvedValueOnce(user);
        expect(await controller.findOne(user.id)).toEqual(user);
      }
    });
  });

  describe('update', () => {
    it('should update a user (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        service.update.mockResolvedValueOnce(user);
        expect(await controller.update(user.id, { username: 'updated' } as UpdateUserDto)).toEqual(user);
      }
    });
  });

  describe('findByEmail', () => {
    it('should find user by email (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        service.findByEmail.mockResolvedValueOnce(user);
        expect(await controller.findByEmail(user.email)).toEqual(user);
      }
    });
  });

  describe('remove', () => {
    it('should remove a user (3 times)', async () => {
      service.remove.mockResolvedValue(undefined);
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        await expect(controller.remove(user.id)).resolves.toBeUndefined();
        expect(service.remove).toHaveBeenCalledWith(user.id);
      }
    });
  });

  describe('toggleFollow', () => {
    it('should toggle follow (3 times)', async () => {
      for (const [user, target] of [
        [mockUser1, mockUser2],
        [mockUser2, mockUser3],
        [mockUser3, mockUser1],
      ]) {
        service.toggleFollow.mockResolvedValueOnce(user);
        const body = { targetEmail: target.email, follow: true };
        expect(await controller.toggleFollow(user.id, body)).toEqual(user);
      }
    });
  });
});
