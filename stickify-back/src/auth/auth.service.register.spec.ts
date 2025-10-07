import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

describe('AuthService - signUp', () => {
  let authService: AuthService;
  let userService: UsersService;
  //Mock datos de un usuario
  const mockUser: User = {
    id: '1234-5678',
    email: 'newuser@example.com',
    password: 'hashedpassword123',
    username: 'NewUser',
    premium: false,
    followers: [],
    following: [],
  };
  //Mock servicio de usuarios (simula la lógica de creación de usuarios)
  const mockUserService = {
    create: jest.fn(),
  };
  //Mock 
  const mockUserRepository = {};

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
    userService = module.get<UsersService>(UsersService);
  });

  it('should call userService.create with correct data and return the created user', async () => {
    //Arrange configura el mock para que devuelva un usuario cuando se llame al servicio create
    mockUserService.create.mockResolvedValue(mockUser);

    //Act con datos del usuario
    const result = await authService.signUp({
      username: 'NewUser',
      email: 'newuser@example.com',
      password: 'password123',
      premium: false,
    });
    //Assert 
    expect(userService.create).toHaveBeenCalledWith({
      username: 'NewUser',
      email: 'newuser@example.com',
      password: 'password123',
      premium: false,
      followers: [],
      following: [],
    });
    //Assert resultado final
    expect(result).toEqual(mockUser);
  });
});