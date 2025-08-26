import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

describe('AuthService - signUp', () => {
  let authService: AuthService;
  let userService: UsersService;

  const mockUser: User = {
    id: '1234-5678',
    email: 'newuser@example.com',
    password: 'hashedpassword123',
    username: 'NewUser',
    premium: false,
    followers: [],
    following: [],
  };

  const mockUserService = {
    create: jest.fn(),
  };

  const mockUserRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should call userService.create with correct data and return the created user', async () => {
    mockUserService.create.mockResolvedValue(mockUser);

    const result = await authService.signUp({
      username: 'NewUser',
      email: 'newuser@example.com',
      password: 'password123',
      premium: false,
    });

    expect(userService.create).toHaveBeenCalledWith({
      username: 'NewUser',
      email: 'newuser@example.com',
      password: 'password123',
      premium: false,
      followers: [],
      following: [],
    });

    expect(result).toEqual(mockUser);
  });
});