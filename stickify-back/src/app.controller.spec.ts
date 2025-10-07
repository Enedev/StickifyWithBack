// src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    //Arrange
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          //Mock del servicio
          provide: AppService,
          useValue: { getHello: jest.fn().mockReturnValue('Hello World!') }, // mockeamos el servicio
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    //Assert
    expect(appController).toBeDefined();
  });

  it('should return "Hello World!"', () => {
    //Assert
    expect(appController.getHello()).toBe('Hello World!');
    expect(appService.getHello).toHaveBeenCalled(); // verificamos que delega al servicio
  });
});
