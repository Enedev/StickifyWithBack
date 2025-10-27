//Credenciales de prueba
const VALID_EMAIL = 'test@stickify.com';
const VALID_PASSWORD = 'password123';
const INVALID_EMAIL = 'bad@email.com';
const INVALID_PASSWORD = 'badpassword';

const LOGIN_API_PATH = '/api/auth/login';

describe('Flujo de Inicio de Sesión (Log In)', () => {
  beforeEach(() => {
    cy.visit('/log-in'); 
  });

  // Caso de prueba 1, inicio de sesión exitoso
  it('debería permitir el login con credenciales válidas y navegar a /home', () => {
    cy.intercept('POST', LOGIN_API_PATH, {
      statusCode: 200,
      body: { 
        token: 'mock-jwt-token', 
        user: { id: 1, email: VALID_EMAIL } 
      },
    }).as('successfulLogin');

    //Ingresa credenciales válidas
    cy.get('input[type="email"]').type(VALID_EMAIL);
    cy.get('input[type="password"]').type(VALID_PASSWORD);

    cy.get('button[type="submit"]').click(); //clic en el botón de inicio de sesión

    cy.wait('@successfulLogin'); //Espera que la solicitud API se complete
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Éxito');
    cy.get('.swal2-html-container').should('contain', 'Inicio de sesión exitoso!');

    //Hace clic en el botón 'OK' de la alerta para que SweetAlert desaparezca y se complete la navegación
    cy.get('.swal2-confirm').click();
    
    cy.url().should('include', '/home'); //navega a /home
  });

  //Caso de Prueba 2, rechazo de credenciales inválidas
  it('debería mostrar un error con credenciales inválidas', () => {
    cy.intercept('POST', LOGIN_API_PATH, {
      statusCode: 404, //error de credenciales inválidas
      body: { 
        detail: 'Invalid credentials'
      },
    }).as('failedLogin');

    //Ingresa credenciales inválidas
    cy.get('input[type="email"]').type(INVALID_EMAIL);
    cy.get('input[type="password"]').type(INVALID_PASSWORD);

    cy.get('button[type="submit"]').click(); //Envía el formulario

    //Verificar la respuesta de SweetAlert2
    cy.wait('@failedLogin');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    //Verifica el texto que se muestra el error 404
    cy.get('.swal2-html-container').should('contain', 'Correo electrónico o contraseña incorrectos.');
    
    cy.get('.swal2-confirm').click(); //cierra la alerta
  });

  //Caso de Prueba 3, validación de Formulario
  it('debería mostrar un error de validación al intentar enviar campos vacíos', () => {

    //Asegurar de que los campos están vacíos
    cy.get('input[type="email"]').should('have.value', '');
    cy.get('input[type="password"]').should('have.value', '');
    
    cy.get('button[type="submit"]').click(); //clic en el botón de iniciar sesión

    //Verifica el mensaje de validación de SweetAlert2
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'Por favor complete todos los campos correctamente');
    
    cy.get('.swal2-confirm').click(); //Cierra la alerta
  });
});