const TEST_USER = {
  id: 'user1@mail.com',
  email: 'user1@mail.com',
  username: 'user1',
  premium: true
};

const MOCK_SONGS = [
  { trackId: 101, artistName: 'Artist A', trackName: 'Song A', primaryGenreName: 'Pop', artworkUrl100: '/assets/test-a.jpg' },
  { trackId: 102, artistName: 'Artist B', trackName: 'Song B', primaryGenreName: 'Rock', artworkUrl100: '/assets/test-b.jpg' }
];

describe('Comentarios de Canciones', () => {
  beforeEach(() => {
    cy.wrap([]).as('commentsState');

    cy.intercept('GET', '**/api/songs', { statusCode: 200, body: MOCK_SONGS }).as('getSongs');

    let commentsState = [];
    cy.intercept('GET', '**/api/comments', (req) => {
      req.reply({ statusCode: 200, body: commentsState });
    }).as('getComments');

    cy.intercept('POST', '**/api/comments', (req) => {
      const body = req.body || {};
      const comment = {
        user: body.user || TEST_USER.username,
        text: body.text || body.comment || '',
        date: body.date || Date.now(),
        trackId: body.trackId || body.trackId === 0 ? body.trackId : body.trackId
      };
      
      commentsState.push(comment);
      req.reply({ statusCode: 201, body: comment });
    }).as('postComment');

    cy.visit('/home', {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(TEST_USER));
        win.localStorage.setItem('authToken', 'mock-token');
      }
    });
  });

  it('debería permitir añadir un comentario a una canción y mostrarlo', () => {
    //espera que se carguen las canciones
    cy.wait('@getSongs');
    //prepara los comentarios
    const commentText = 'E2E comment: great track';

    //abre un modal de canción
    cy.get('app-song-card').first().within(() => {
      cy.get('.song-container, button, .song-details').first().click({ force: true });
    });

    cy.get('app-song-modal').should('exist').and('be.visible').within(() => {
      //escribe un comentario y lo envía
      cy.get('input[placeholder="Escribe tu comentario..."]').should('exist').clear().type(commentText);
      cy.contains('Enviar').click();

      //se debe mostrar el comentario en el modal
      cy.get('.comments-section .comment').should('contain.text', commentText);
    });
    
    // Verifica que la solicitud POST se realizó con los datos correctos
    cy.wait('@postComment').its('request.body').then((body) => {
      expect(body).to.have.property('text');
      expect(body.text).to.equal(commentText);
      expect(body).to.have.property('trackId');

      expect(Number(body.trackId)).to.equal(MOCK_SONGS[0].trackId);
      expect(body).to.have.property('user');
    
      expect(body.user).to.equal(TEST_USER.username);
    });

    cy.get('.comments-section .comment').should('contain.text', commentText);
  });
});
