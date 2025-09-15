import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
    jwt = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return token (3 times)', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed');
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        repo.create.mockReturnValue(user);
        repo.save.mockResolvedValue(user);
        expect(await service.create({ ...user, password: 'plain' })).toEqual({
          success: true,
          token: 'token',
        });
      }
    });
    it('should throw BadRequestException on error (3 times)', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed');
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        repo.create.mockReturnValue(user);
        repo.save.mockRejectedValue({ code: 'fail', detail: 'fail' });
        await expect(service.create({ ...user, password: 'plain' })).rejects.toMatchObject({ response: { code: 'fail', detail: 'fail' } });
      }
    });
  });

  describe('findByUsername', () => {
    it('should find user by username (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        repo.findOne.mockResolvedValue(user);
        expect(await service.findByUsername(user.username)).toEqual(user);
      }
    });
  });

  describe('findOne', () => {
    it('should find user by id (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        repo.findOne.mockResolvedValue(user);
        expect(await service.findOne(user.id)).toEqual(user);
      }
    });
  });

  describe('update', () => {
    it('should update user and return updated (3 times)', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed');
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        repo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
        repo.findOne.mockResolvedValue(user);
        expect(await service.update(user.id, { password: 'new' })).toEqual(user);
      }
    });
  });

  describe('remove', () => {
    it('should call delete 3 times', async () => {
      const deleteResult = { raw: {}, affected: 1 };
      repo.delete.mockResolvedValue(deleteResult);
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        await expect(service.remove(user.id)).resolves.toBeUndefined();
        expect(repo.delete).toHaveBeenCalledWith(user.id);
      }
    });
  });

  describe('findByEmail', () => {
    it('should find user by email (3 times)', async () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        repo.findOne.mockResolvedValue(user);
        expect(await service.findByEmail(user.email)).toEqual(user);
      }
    });
  });

  describe('toggleFollow', () => {
    it('should follow and unfollow users (3 times)', async () => {
    for (const [origUser, origTarget] of [
        [mockUser1, mockUser2],
        [mockUser2, mockUser3],
        [mockUser3, mockUser1],
    ]) {
        // Clonar para evitar efectos colaterales
        const user = { ...origUser, followers: [...origUser.followers], following: [...origUser.following] };
        const target = { ...origTarget, followers: [...origTarget.followers], following: [...origTarget.following] };
        // Mockear findOne para devolver user y luego target
        repo.findOne.mockImplementationOnce(() => Promise.resolve(user))
                    .mockImplementationOnce(() => Promise.resolve(target));
        repo.save.mockResolvedValue(user);
        // Follow
        user.following = [];
        target.followers = [];
        expect(await service.toggleFollow(user.id, target.email, true)).toEqual(user);
        // Unfollow
        user.following = [target.email];
        target.followers = [user.email];
        // Mockear de nuevo para la segunda llamada
        repo.findOne.mockImplementationOnce(() => Promise.resolve(user))
                    .mockImplementationOnce(() => Promise.resolve(target));
        expect(await service.toggleFollow(user.id, target.email, false)).toEqual(user);
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
        repo.find.mockResolvedValue(arr);
        expect(await service.findAll()).toEqual(arr);
      }
    });
  });

  describe('getToken', () => {
    it('should return a token (3 times)', () => {
      for (const user of [mockUser1, mockUser2, mockUser3]) {
        expect(service.getToken(user)).toBe('token');
      }
    });
  });
});
