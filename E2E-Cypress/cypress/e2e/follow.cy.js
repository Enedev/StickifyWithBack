describe('User Follows Tests', () => {
  const TEST_USER = {
    id: 'test@example.com',
    email: 'test@example.com',
    username: 'testUser',
    premium: false,
    following: []
  };

  const MOCK_USERS = [
    {
      id: 'other1@example.com',
      email: 'other1@example.com',
      username: 'otherUser1',
      premium: true
    },
    {
      id: 'other2@example.com',
      email: 'other2@example.com',
      username: 'otherUser2',
      premium: false
    }
  ];

  beforeEach(() => {
    //Intercepta la petición del usuario
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: MOCK_USERS
    }).as('getUsers');

    //Intercepta las petición de follow/unfollow
    cy.intercept('PUT', '**/users/*/follow', (req) => {
      const { targetEmail, follow } = req.body;
      
      //Actualiza el usuario actual
      if (follow) {
        TEST_USER.following.push(targetEmail);
      } else {
        TEST_USER.following = TEST_USER.following.filter(email => email !== targetEmail);
      }

      req.reply({
        statusCode: 200,
        body: TEST_USER
      });
    }).as('toggleFollow');

    cy.visit('/user-follows', {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(TEST_USER));
        win.localStorage.setItem('authToken', 'mock-token');
      }
    });

    //Espera la carga de la lista de usuarios
    cy.wait('@getUsers');
  });

  it('debe mostrar la interfaz de búsqueda de usuarios y listar los usuarios', () => {
    //comprueba la interfaz de búsqueda
    cy.get('.search-section h2').should('contain', 'Encuentra y Sigue Usuarios');
    cy.get('.search-input').should('be.visible');

    //comprueba que los usuarios mockeados se muestran
    cy.get('.user-card').should('have.length', MOCK_USERS.length);
    
    //Verifica el primer usuario
    cy.get('.user-card').first().within(() => {
      cy.contains(MOCK_USERS[0].username).should('be.visible');
      cy.contains(MOCK_USERS[0].email).should('be.visible');
      cy.get('.follow-button').should('be.visible');
      cy.get('.premium-status').should('contain', 'Premium');
    });

    cy.get('.user-card').last().within(() => {
      cy.contains(MOCK_USERS[1].username).should('be.visible');
      cy.contains(MOCK_USERS[1].email).should('be.visible');
      cy.get('.follow-button').should('be.visible');
      cy.get('.premium-status').should('contain', 'No Premium');
    });
  });

  it('debe permitir seguir y dejar de seguir a los usuarios', () => {
    const targetUser = MOCK_USERS[0];

    //Seguir usuario
    cy.contains('.user-card', targetUser.username).within(() => {
      cy.get('.follow-button').click();
    });

    //Verifica mensaje de éxito
    cy.get('.swal2-popup')
      .should('be.visible')
      .should('contain', `Ahora sigues a ${targetUser.username}`);

    //Verificar que el botón cambió a "Dejar de Seguir"
    cy.contains('.user-card', targetUser.username)
      .find('.follow-button')
      .should('have.class', 'unfollow')
      .should('contain', 'Dejar de Seguir');

    //Verifica la petición de follow
    cy.wait('@toggleFollow').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        targetEmail: targetUser.email,
        follow: true
      });
    });

    //Dejar de seguir usuario
    cy.contains('.user-card', targetUser.username).within(() => {
      cy.get('.follow-button').click();
    });

    //Verifica mensaje de dejar de seguir
    cy.get('.swal2-popup')
      .should('be.visible')
      .should('contain', `Has dejado de seguir a ${targetUser.username}`);

    cy.contains('.user-card', targetUser.username)
      .find('.follow-button')
      .should('not.have.class', 'unfollow')
      .should('contain', 'Seguir');

    cy.wait('@toggleFollow').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        targetEmail: targetUser.email,
        follow: false
      });
    });
  });

  it('debe filtrar a los usuarios según el término de búsqueda', () => {
    //Busca por nombre de usuario
    cy.get('.search-input').type(MOCK_USERS[0].username);
    cy.get('.user-card').should('have.length', 1);
    cy.contains(MOCK_USERS[0].username).should('be.visible');

    //Limpia y busca por email
    cy.get('.search-input').clear().type(MOCK_USERS[0].email);
    cy.get('.user-card').should('have.length', 1);
    cy.contains(MOCK_USERS[0].email).should('be.visible');

    //Busca término que no existe
    cy.get('.search-input').clear().type('nonexistentuser');
    cy.get('.no-users-message').should('be.visible');
    cy.get('.user-card').should('not.exist');

    //Limpia búsqueda para mostrar todos los usuarios
    cy.get('.search-input').clear();
    cy.get('.user-card').should('have.length', MOCK_USERS.length);
  });
});