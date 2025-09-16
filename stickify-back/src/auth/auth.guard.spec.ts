// src/auth/auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

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
      const token = 'valid-token';
      const context = mockExecutionContext(`Bearer ${token}`);
      jwtService.verify.mockReturnValueOnce({ userId: '123' });

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException if no authorization header', () => {
      const context = mockExecutionContext();
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      const token = 'invalid-token';
      const context = mockExecutionContext(`Bearer ${token}`);
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should extract token correctly from Bearer header', () => {
      const context = mockExecutionContext('Bearer extracted-token');
      jwtService.verify.mockReturnValueOnce({ userId: '456' });

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('extracted-token');
    });
  });
});
