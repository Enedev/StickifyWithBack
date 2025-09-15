import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const loginDto1: LoginDto = { email: 'user1@mail.com', password: 'pass1' };
  const loginDto2: LoginDto = { email: 'user2@mail.com', password: 'pass2' };
  const loginDto3: LoginDto = { email: 'user3@mail.com', password: 'pass3' };

  const signUpDto1: SignUpDto = { username: 'user1', email: 'user1@mail.com', password: 'pass1' };
  const signUpDto2: SignUpDto = { username: 'user2', email: 'user2@mail.com', password: 'pass2' };
  const signUpDto3: SignUpDto = { username: 'user3', email: 'user3@mail.com', password: 'pass3' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signUp: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login with 3 different users', async () => {
      for (const dto of [loginDto1, loginDto2, loginDto3]) {
        const user = {
          id: dto.email.split('@')[0],
          username: dto.email.split('@')[0],
          email: dto.email,
          premium: false,
          followers: [],
          following: [],
        };
        const result = { success: true, token: `${dto.email}-token`, user };
        service.login.mockResolvedValueOnce(result);
        expect(await controller.login(dto)).toEqual(result);
      }
    });
  });

  describe('signUp', () => {
    it('should sign up 3 different users', async () => {
      for (const dto of [signUpDto1, signUpDto2, signUpDto3]) {
        const result = { success: true, token: `${dto.username}-token` };
        service.signUp.mockResolvedValueOnce(result);
        expect(await controller.signUp(dto)).toEqual(result);
      }
    });
  });
});
