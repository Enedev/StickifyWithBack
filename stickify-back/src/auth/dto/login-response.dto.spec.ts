// src/auth/dto/login-response.dto.spec.ts
import { LoginResponse } from './login-response.dto';

describe('LoginResponse DTO', () => {
  it('should create an instance with given values', () => {
    const dto: LoginResponse = {
      success: true,
      token: 'sample-token',
    };

    expect(dto).toBeDefined();
    expect(dto.success).toBe(true);
    expect(dto.token).toBe('sample-token');
  });

  it('should allow different values', () => {
    const dto: LoginResponse = {
      success: false,
      token: 'another-token',
    };

    expect(dto.success).toBe(false);
    expect(dto.token).toBe('another-token');
  });
});
