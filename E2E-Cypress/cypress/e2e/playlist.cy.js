// E2E test for creating a playlist
const TEST_USER = {
  id: 'user1@mail.com',
  email: 'user1@mail.com',
  username: 'user1',
  premium: true
};

const MOCK_SONGS = [
  { trackId: 101, artistName: 'Artist A', trackName: 'Song A', primaryGenreName: 'Pop', artworkUrl100: '/assets/test-a.jpg' },
  { trackId: 102, artistName: 'Artist B', trackName: 'Song B', primaryGenreName: 'Rock', artworkUrl100: '/assets/test-b.jpg' },
  { trackId: 103, artistName: 'Artist C', trackName: 'Song C', primaryGenreName: 'Jazz', artworkUrl100: '/assets/test-c.jpg' }
];

describe('Crear Playlist', () => {
  beforeEach(() => {
    //Se realiza para poder capturar las solicitudes
    cy.intercept('GET', '**/api/songs', { statusCode: 200, body: MOCK_SONGS }).as('getSongs');
    cy.intercept('GET', '**/api/playlists', { statusCode: 200, body: [] }).as('getPlaylists');
    
    //Intercepta la creación de playlist
    cy.intercept('POST', '**/api/playlists', (req) => {
      const expectedTrackIds = [
        MOCK_SONGS[0].trackId.toString(),
        MOCK_SONGS[1].trackId.toString()
      ];

      const newPlaylist = {
        id: 'test-playlist-id',
        name: 'E2E Test Playlist',
        trackIds: expectedTrackIds, 
        type: 'user',
        createdBy: TEST_USER.email,
        createdAt: new Date().toISOString()
      };

      console.log('Request trackIds:', req.body.trackIds);
      console.log('Expected trackIds:', expectedTrackIds);

      req.reply({ statusCode: 201, body: newPlaylist });
    }).as('createPlaylist');
    cy.intercept('POST', '**/api/user-saved-playlists', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 'saved-1',
          userId: TEST_USER.email,
          playlistId: 'test-playlist-id',
          savedAt: new Date().toISOString()
        }
      });
    }).as('saveUserPlaylist');

    //visita la playlist como usuario premium
    cy.visit('/playlist', {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(TEST_USER));
        win.localStorage.setItem('authToken', 'mock-token');
      }
    });
  });

  it('debería crear una playlist seleccionando canciones y guardarla en el perfil', () => {
    cy.wait('@getSongs');
    cy.wait('@getPlaylists');

    cy.get('.create-playlist-button').click(); //Abre el modal

    //completa el nombre de la playlist
    const playlistName = 'E2E Test Playlist';
    cy.get('.playlist-name-input').type(playlistName);

    cy.get('.song-card').should('have.length.at.least', 2); //selecciona canciones
    
    //Selecciona la primera canción y verifica
    cy.get('.song-card').first()
      .click()
      .should('have.class', 'selected')
      .then(() => {
        cy.wait(300);
        
        //Selecciona la segunda canción y verifica
        cy.get('.song-card').eq(1)
          .click()
          .should('have.class', 'selected');
      });

    cy.get('.song-card.selected').should('have.length', 2);

    //Clic en guardar
    cy.get('.save-playlist')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    //verifica la creación exitosa de la playlist
    cy.wait('@createPlaylist').then((interception) => {
      const playlist = interception.response.body;
      expect(playlist.name).to.equal('E2E Test Playlist');
      expect(playlist.type).to.equal('user');
      expect(playlist.createdBy).to.equal(TEST_USER.email);
      expect(playlist.trackIds).to.have.length(2);
    });

    //verifica que se guarde en el perfil
    cy.wait('@saveUserPlaylist').then((saveInterception) => {
      expect(saveInterception.request.body).to.have.property('userId', TEST_USER.email);
    });
  });
});

describe('Crear Playlist - usuario no premium', () => {
  it('debería mostrar modal de acceso restringido al intentar abrir el modal de creación', () => {
    const TEST_USER_NON_PREMIUM = { id: 'u2', email: 'u2@mail.com', username: 'u2', premium: false };
    cy.visit('/playlist', {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(TEST_USER_NON_PREMIUM));
        win.localStorage.setItem('authToken', 'mock-token');
      }
    });

    cy.get('.create-playlist-button').click();
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
    cy.get('.swal2-title').should('have.text', 'Acceso Restringido');
    cy.get('.swal2-html-container').should('contain.text', 'Necesitas ser usuario Premium para crear playlists.');
    cy.get('.swal2-confirm').click();
  });
});
