import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let userService: UsersService;

  const mockUser: User = {
    id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
    username: 'TestUser',
    premium: false,
    followers: [],
    following: [],
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockUserService = {
    getToken: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UsersService>(UsersService);
  });

  it('should return token and user data if credentials are valid', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.token).toBe('mocked-jwt-token');
    expect(result.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
      premium: mockUser.premium,
      followers: [],
      following: [],
    });
  });

  it('should throw NotFoundException if credentials are invalid', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'notfound@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
