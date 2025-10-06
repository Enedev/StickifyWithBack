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
  //Mock datos de un usuario
  const mockUser: User = {
    id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
    username: 'TestUser',
    premium: false,
    followers: [],
    following: [],
  };
  //Mock repositorio de usuarios
  const mockUserRepository = {
    findOneBy: jest.fn(),
  };
  //Mock servicio de usuarios (obtención de tokens)
  const mockUserService = {
    getToken: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  beforeEach(async () => {
    //Arrange crea un modulo e inyecta los mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should return token and user data if credentials are valid', async () => {
    //Arrange simula búsqueda del usuario
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    //Act login con credenciales válidas
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });
    //Assert 
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
    //Arrange simula búsqueda del usuario
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    //Assert login con credenciales inválidas
    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user is not found', async () => {
    //Arrange simula usuario no encontrado
    mockUserRepository.findOneBy.mockResolvedValue(null);
    //Assert login con usuario inexistente
    await expect(
      authService.login({
        email: 'notfound@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
