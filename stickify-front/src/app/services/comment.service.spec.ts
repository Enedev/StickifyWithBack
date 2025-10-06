import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { Comment } from '../shared/interfaces/comment.interface';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  const mockComments: Comment[] = [
    { id: 'c1', userId: 'u1', text: 'Great song', trackId: 1, createdAt: new Date() },
    { id: 'c2', userId: 'u2', text: 'Love it', trackId: 2, createdAt: new Date() }
  ] as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
  //Arrange
  // The service constructor triggers a GET /comments; flush it here to avoid open request
  const req = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/comments'));
  req.flush([]); //Act
  //Assert
  expect(service).toBeTruthy();
  });

  it('should load comments on init and populate commentsMap$', (done) => {
    //Arrange
    // When the service is instantiated, it should call GET /comments
    const req = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/comments')); //Act
    //Assert
    expect(req.request.method).toBe('GET');
    req.flush(mockComments);

    service.commentsMap$.subscribe(map => {
      // map should have entries for trackId 1 and 2
      //Assert
      expect(map[1].length).toBe(1);
      //Assert
      expect(map[2].length).toBe(1);
      done();
    });
  });

  it('getCommentsForTrack should return comments for a given track', () => {
    //Arrange
    // Prime the internal subject by flushing the GET request
    const req = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/comments'));
    req.flush(mockComments);

    //Act
    const commentsFor1 = service.getCommentsForTrack(1);
    //Assert
    expect(Array.isArray(commentsFor1)).toBeTrue();
    //Assert
    expect(commentsFor1.length).toBe(1);
    //Assert
    expect(commentsFor1[0].text).toBe('Great song');
  });

  it('postComment should POST and reload comments on success', async () => {
    //Arrange
    // Flush initial GET
    const initReq = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/comments'));
    initReq.flush(mockComments);

    const newComment: Comment = { id: 'c3', userId: 'u3', text: 'Nice', trackId: 1, createdAt: new Date() } as any;

    //Act
    const postPromise = service.postComment(1, newComment);

    const postReq = httpMock.expectOne((req) => req.method === 'POST' && req.url.endsWith('/comments'));
    //Assert
    expect(postReq.request.body.trackId).toBe(1);
    postReq.flush({}); // respond success

    // After post, service should call GET /comments again; flush with updated list
    const reloadReq = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/comments'));
    reloadReq.flush([...mockComments, newComment]);

    await expectAsync(postPromise).toBeResolved();

    //Act
    const commentsFor1 = service.getCommentsForTrack(1);
    //Assert
    expect(commentsFor1.length).toBe(2);
  });

  it('postComment should reject promise on error', async () => {
    //Arrange
    // Flush initial GET
    const initReq = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/comments'));
    initReq.flush(mockComments);

    const badComment: Comment = { id: 'x', userId: 'u', text: 'x', trackId: 99, createdAt: new Date() } as any;

    //Act
    const postPromise = service.postComment(99, badComment);

    const postReq = httpMock.expectOne((req) => req.method === 'POST' && req.url.endsWith('/comments'));
    postReq.flush('Error', { status: 500, statusText: 'Server Error' });

    //Assert
    await expectAsync(postPromise).toBeRejected();
  });

});
