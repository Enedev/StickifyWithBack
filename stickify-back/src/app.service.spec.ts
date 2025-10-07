// src/app.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    //Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    //Assert
    expect(service).toBeDefined();
  });

  it('should return "Hello World!"', () => {
    //Assert
    expect(service.getHello()).toBe('Hello World!');
  });
});
