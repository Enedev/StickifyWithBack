// src/comments/comments.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsModule } from './comments.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CommentsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    //Arrange crea un modulo de prueba e importa CommentsModule
    module = await Test.createTestingModule({
      imports: [CommentsModule],
    })
      //Mock repositorio de comentarios
      .overrideProvider(getRepositoryToken(Comment))
      .useValue({}) // mock del repositorio de Comment
      .compile();
  });

  it('should be defined', () => {
    //Assert verifica que el modulo esté definido
    expect(module).toBeDefined();
  });

  it('should provide CommentsService', () => {
    //Arrange obtiene el servicio de comentarios
    const service = module.get<CommentsService>(CommentsService);
    //Assert verifica que el servicio esté disponible
    expect(service).toBeDefined();
  });

  it('should register CommentsController', () => {
    //Arrange obtiene el controlador de comentarios
    const controller = module.get<CommentsController>(CommentsController);
    //Assert verifica que el controlador esté disponible
    expect(controller).toBeDefined();
  });
});
