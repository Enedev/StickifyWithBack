import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

//Mock datos de comentarios
const mockComment1 = { id: '1', user: 'user1@mail.com', text: 'Comentario 1', date: 1690000000000, trackId: 101 };
const mockComment2 = { id: '2', user: 'user2@mail.com', text: 'Comentario 2', date: 1690000001000, trackId: 102 };
const mockComment3 = { id: '3', user: 'user3@mail.com', text: 'Comentario 3', date: 1690000002000, trackId: 103 };

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  beforeEach(async () => {
    //Arrange crea un modulo de prueba e inyecta el mock del servicio de comentarios
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findCommentsByUser: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment (3 times)', async () => {
      for (const comment of [mockComment1, mockComment2, mockComment3]) {
        //Mock simula la creación del comentario
        service.create.mockResolvedValueOnce(comment);
        //Arrange dto de creación
        const dto: CreateCommentDto = { user: comment.user, text: comment.text, date: comment.date, trackId: comment.trackId };
        //Assert
        expect(await controller.create(dto)).toEqual(comment);
      }
    });
  });

  describe('findAll', () => {
    it('should return all comments (3 times)', async () => {
      for (const arr of [
        [mockComment1],
        [mockComment2],
        [mockComment1, mockComment2, mockComment3],
      ]) {
        //Mock simula la obtención de todos los comentarios
        service.findAll.mockResolvedValueOnce(arr);
        //Assert
        expect(await controller.findAll()).toEqual(arr);
      }
    });
  });

  describe('findCommentsByUser', () => {
    it('should return comments by user (3 times)', async () => {
      for (const arr of [
        [mockComment1],
        [mockComment2],
        [mockComment1, mockComment2, mockComment3],
      ]) {
        //Mock
        service.findCommentsByUser.mockResolvedValueOnce(arr);
        //Assert
        expect(await controller.findCommentsByUser(arr[0].user)).toEqual(arr);
      }
    });
  });

  describe('findOne', () => {
    it('should return a comment by id (3 times)', async () => {
      for (const comment of [mockComment1, mockComment2, mockComment3]) {
        //Mock
        service.findOne.mockResolvedValueOnce(comment);
        //Assert
        expect(await controller.findOne(comment.id)).toEqual(comment);
      }
    });
  });

  describe('update', () => {
    it('should update a comment (3 times)', async () => {
      for (const comment of [mockComment1, mockComment2, mockComment3]) {
        //Mock
        service.update.mockResolvedValueOnce(comment);
        //Assert
        expect(await controller.update(comment.id, { text: 'Actualizado' } as UpdateCommentDto)).toEqual(comment);
      }
    });
  });

  describe('remove', () => {
    it('should remove a comment (3 times)', async () => {
      //Mock
      service.remove.mockResolvedValue(undefined);
      for (const comment of [mockComment1, mockComment2, mockComment3]) {
        //Assert
        await expect(controller.remove(comment.id)).resolves.toBeUndefined();
        expect(service.remove).toHaveBeenCalledWith(comment.id);
      }
    });
  });
});
