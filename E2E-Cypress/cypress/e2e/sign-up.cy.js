const TEST_USERNAME = 'testuser';
const TEST_EMAIL = 'test@stickify.com';
const TEST_PASSWORD = 'password123';

const SIGNUP_API_PATH = '/api/auth/sign-up';
const GET_USER_BY_EMAIL = (email) => `/api/users/by-email/${email}`;

describe('Flujo de Registro (Sign Up)', () => {
  beforeEach(() => {
    cy.visit('/sign-up');
  });

  it('debería registrarse correctamente y redirigir a /log-in', () => {
    cy.intercept('POST', SIGNUP_API_PATH, {
      statusCode: 200,
      body: {
        success: true,
        token: 'mock-signup-token'
      }
    }).as('signUp');

    cy.intercept('GET', GET_USER_BY_EMAIL(TEST_EMAIL), {
      statusCode: 200,
      body: {
        id: TEST_EMAIL,
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        name: 'Test User',
        premium: false,
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getUser');

    // Rellena formulario
    cy.get('input[formControlName="username"]').type(TEST_USERNAME);
    cy.get('input[formControlName="email"]').type(TEST_EMAIL);
    cy.get('input[formControlName="password"]').type(TEST_PASSWORD);
    cy.get('input[formControlName="repeatPassword"]').type(TEST_PASSWORD);

    cy.get('button[type="submit"]').click();

    // Acepta el modal de confirmación si aparece (flujo sin premium)
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
    cy.get('.swal2-title').then(($t) => {
      const text = $t.text().trim();
      if (text.includes('¿Estás seguro?')) {
        cy.get('.swal2-confirm').click();
      }
    });

    //Espera a las peticiones mockeadas
    cy.wait('@signUp').its('response.body').should('have.property', 'success', true);
    cy.wait('@getUser').its('response.statusCode').should('equal', 200);

    //Comprueba SweetAlert y navegación
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
    cy.get('.swal2-title').should('have.text', 'Éxito');
    cy.get('.swal2-html-container').should('contain.text', 'Registro exitoso');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/log-in');
  });

  it('debería mostrar error si el correo ya está registrado', () => {
    cy.intercept('POST', SIGNUP_API_PATH, {
      statusCode: 400,
      body: {
        detail: 'Email already exists',
        code: '23505'
      }
    }).as('signUpExists');

    //llena formulario
    cy.get('input[formControlName="username"]').type('other');
    cy.get('input[formControlName="email"]').type('exists@d.example');
    cy.get('input[formControlName="password"]').type('p');
    cy.get('input[formControlName="repeatPassword"]').type('p');
    cy.get('button[type="submit"]').click();

    //Acepta el modal de confirmación si aparece (flujo sin premium)
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
    cy.get('.swal2-title').then(($t) => {
      const text = $t.text().trim();
      if (text.includes('¿Estás seguro?')) {
        cy.get('.swal2-confirm').click();
      }
    });

    cy.wait('@signUpExists');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain.text', 'Error');
    cy.get('.swal2-html-container').should('contain.text', 'Este correo electrónico ya está registrado.');
    cy.get('.swal2-confirm').click();
  });

  it('debería validar formulario y mostrar mensaje si faltan campos', () => {
    //Asegura campos vacíos
    cy.get('input[formControlName="username"]').should('have.value', '');
    cy.get('input[formControlName="email"]').should('have.value', '');
    cy.get('input[formControlName="password"]').should('have.value', '');
    cy.get('input[formControlName="repeatPassword"]').should('have.value', '');

    cy.get('button[type="submit"]').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain.text', 'Error');
    cy.get('.swal2-html-container').should('contain.text', 'Por favor complete todos los campos correctamente');
    cy.get('.swal2-confirm').click();
  });
});
