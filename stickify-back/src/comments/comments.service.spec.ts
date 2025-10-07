import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let repository: Repository<Comment>;
  //Mock comentario
  const mockComment: Comment = {
    id: 'c1',
    user: 'testuser@example.com',
    text: 'Great song!',
    date: Date.now(),
    trackId: 101,
  };
  //Mock repositorio, reemplaza métodos con jest
  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => ({ ...dto })),
    save: jest.fn().mockResolvedValue(mockComment),
    find: jest.fn().mockResolvedValue([mockComment]),
    findOne: jest.fn().mockResolvedValue(mockComment),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    //Arrange crea un modulo e inyecta el mock del repositorio
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    repository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
  });

  it('should create a comment', async () => {
    //Arrange 
    const dto: CreateCommentDto = {
      user: 'testuser@example.com',
      text: 'Awesome!',
      date: Date.now(),
      trackId: 101,
    };
    //Act 
    const result = await service.create(dto);
    //Assert
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockComment);
  });

  it('should return all comments', async () => {
    //Act
    const result = await service.findAll();
    //Assert
    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual([mockComment]);
  });

  it('should return comments by user', async () => {
    //Act
    const result = await service.findCommentsByUser('testuser@example.com');
    //Assert
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { user: 'testuser@example.com' },
    });
    expect(result).toEqual([mockComment]);
  });

  it('should return one comment by ID', async () => {
    //Act
    const result = await service.findOne('c1');
    //Assert
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(result).toEqual(mockComment);
  });

  it('should update a comment', async () => {
    //Arrange 
    const dto: UpdateCommentDto = {
      text: 'Updated comment',
    };
    //Act
    const result = await service.update('c1', dto);
    //Assert
    expect(mockRepository.save).toHaveBeenCalledWith({ id: 'c1', ...dto });
    expect(result).toEqual(mockComment);
  });

  it('should remove a comment', async () => {
    //Act
    await service.remove('c1');
    //Assert
    expect(mockRepository.delete).toHaveBeenCalledWith('c1');
  });
});
