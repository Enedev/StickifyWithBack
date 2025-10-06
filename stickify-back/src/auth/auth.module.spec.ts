// src/auth/auth.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    //Arrange crea un modulo de prueba e importa AuthModule y JwtModule
    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        JwtModule.register({
          global: true,
          secret: 'AABBCC',
          signOptions: { expiresIn: '1h' },
        }),
      ],
    })
      //Mock repositorio de usuarios 
      .overrideProvider(getRepositoryToken(User))
      .useValue({}) // mock vacío del repositorio
      .compile();
  });

  it('should be defined', () => {
    //Assert
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    //Arrange
    const service = module.get<AuthService>(AuthService);
    //Assert
    expect(service).toBeDefined();
  });

  it('should provide UsersService', () => {
    //Arrange
    const service = module.get<UsersService>(UsersService);
    //Assert
    expect(service).toBeDefined();
  });

  it('should register AuthController', () => {
    //Arrange
    const controller = module.get<AuthController>(AuthController);
    //Assert
    expect(controller).toBeDefined();
  });
});
