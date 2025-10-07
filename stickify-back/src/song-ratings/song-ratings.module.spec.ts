// src/song-ratings/song-ratings.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RatingsModule } from './song-ratings.module';
import { RatingsService } from './song-ratings.service';
import { RatingsController } from './song-ratings.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SongRating } from './entities/song-rating.entity';

describe('RatingsModule', () => {
  let ratingsService: RatingsService;
  let ratingsController: RatingsController;

  beforeEach(async () => {
    //Arrange crea un modulo de prueba e importa RatingsModule
    const module: TestingModule = await Test.createTestingModule({
      imports: [RatingsModule],
    })
      //Mock del repositorio de SongRating
      .overrideProvider(getRepositoryToken(SongRating)) // sobrescribimos el repo real
      .useValue({}) // mock vacío o se puede añadir métodos (find, save, etc.)
      .compile();
    //Act obtiene el servicio y el controlador del modulo
    ratingsService = module.get<RatingsService>(RatingsService);
    ratingsController = module.get<RatingsController>(RatingsController);
  });

  it('should be defined', () => {
    //Assert verifica que el modulo, servicio y controlador estén definidos 
    expect(ratingsService).toBeDefined();
    expect(ratingsController).toBeDefined();
  });
});
