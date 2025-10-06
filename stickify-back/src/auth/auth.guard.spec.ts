// src/auth/auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    //Mock del servicio JWT
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(), //Función simulada para verificar tokens
          },
        },
      ],
    }).compile();
    //Arrange inicializa guard y servicio
    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });
  //Mock ejecución para simular solicitudes HTTP
  const mockExecutionContext = (authorization?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: authorization ? { authorization } : {},
        }),
      }),
    } as unknown as ExecutionContext);

  describe('canActivate', () => {
    it('should allow access when token is valid', () => {
      //Arrange token válido
      const token = 'valid-token';
      const context = mockExecutionContext(`Bearer ${token}`);
      jwtService.verify.mockReturnValueOnce({ userId: '123' });

      //Act 
      const result = guard.canActivate(context);
      //Assert
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException if no authorization header', () => {
      //Arrange 
      const context = mockExecutionContext();
      //Assert 
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      //Arrange token inválido
      const token = 'invalid-token';
      const context = mockExecutionContext(`Bearer ${token}`);
      //Mock para error en la verificación del token
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      //Assert
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should extract token correctly from Bearer header', () => {
      //Arrange token con prefijo Bearer
      const context = mockExecutionContext('Bearer extracted-token');
      jwtService.verify.mockReturnValueOnce({ userId: '456' });
      //Act
      const result = guard.canActivate(context);
      //Assert
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('extracted-token');
    });
  });
});
