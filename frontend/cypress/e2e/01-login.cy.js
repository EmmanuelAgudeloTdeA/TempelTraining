// CP-01 Login: elementos, título, URL, estilos CSS y autenticación válida / no válida.
describe('CP-01 Login - Tempel Training', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('CP-01.1 Valida título, URL, elementos presentes y estilos de la pantalla de login', () => {
    // 1. Título de la página igual al esperado
    cy.title().should('eq', 'tempel-frontend');
    // 2. URL igual a la esperada
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`);
    // 3. Imagen del logo presente y visible
    cy.get('img[alt="Tempel Training"]').should('be.visible').and('have.attr', 'src');
    // 4. Texto del encabezado principal
    cy.get('h1').should('have.text', 'Tempel Training');
    // 5. Texto del subtítulo del formulario
    cy.get('h2').should('contain.text', 'Iniciar sesión');
    // 6. Inputs presentes
    cy.get('input[type="email"]').should('be.visible').and('have.attr', 'placeholder', 'correo@tempel.com');
    cy.get('input[placeholder="••••••••"]').should('be.visible').and('have.attr', 'type', 'password');
    // 7. Botones presentes
    cy.contains('button', 'Iniciar sesión').should('be.visible').and('have.attr', 'type', 'submit');
    cy.contains('button', '¿Olvidaste tu contraseña?').should('be.visible');
    // 8. CSS: fuente Inter en el body
    cy.get('body').should('have.css', 'font-family').and('include', 'Inter');
    // 9. CSS: color de fondo del body (#0D0F12)
    cy.get('body').should('have.css', 'background-color', 'rgb(13, 15, 18)');
    // 10. CSS: color de fondo y de texto del botón principal (#29B6F6 / blanco)
    cy.contains('button', 'Iniciar sesión')
      .should('have.css', 'background-color', 'rgb(41, 182, 246)')
      .and('have.css', 'color', 'rgb(255, 255, 255)');
    // 11. CSS: color del título (#E5E7EB)
    cy.get('h1').should('have.css', 'color', 'rgb(229, 231, 235)');
  });

  it('CP-01.2 Muestra/oculta la contraseña con el botón del ojo (actions)', () => {
    // 1. Escribir correo
    cy.get('input[type="email"]').type('demo@tempel.com');
    // 2. Validar valor escrito
    cy.get('input[type="email"]').should('have.value', 'demo@tempel.com');
    // 3. Escribir contraseña
    cy.get('input[placeholder="••••••••"]').type('secreto123');
    // 4. La contraseña inicia oculta
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'password');
    // 5. Clic en el botón del ojo
    cy.get('input[placeholder="••••••••"]').parent().find('button').click();
    // 6. La contraseña ahora es visible
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'text');
    // 7. Valor de la contraseña
    cy.get('input[placeholder="••••••••"]').should('have.value', 'secreto123');
    // 8. Clic de nuevo para ocultarla
    cy.get('input[placeholder="••••••••"]').parent().find('button').click();
    // 9. Vuelve a estar oculta
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'password');
    // 10. Limpiar el correo
    cy.get('input[type="email"]').clear().should('have.value', '');
    // 11. Sigue en la página de login
    cy.url().should('include', '/login');
  });

  it('CP-01.3 Autenticación NO válida muestra mensaje de error', () => {
    // 1. Validar que el formulario está visible
    cy.get('form').should('be.visible');
    // 2. Escribir correo inexistente
    cy.get('input[type="email"]').type('noexiste@tempel.com');
    // 3. Escribir contraseña incorrecta
    cy.get('input[placeholder="••••••••"]').type('ClaveIncorrecta1');
    // 4. Validar valores
    cy.get('input[type="email"]').should('have.value', 'noexiste@tempel.com');
    // 5. Enviar formulario
    cy.contains('button', 'Iniciar sesión').click();
    // 6. Mensaje de error de credenciales
    cy.contains('p', 'Credenciales inválidas.').should('be.visible');
    // 7. CSS: el mensaje es rojo (#EF4444)
    cy.contains('p', 'Credenciales inválidas.').should('have.css', 'color', 'rgb(239, 68, 68)');
    // 8. La URL no cambia
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`);
    // 9. No se guardó token
    cy.window().its('localStorage').invoke('getItem', 'tempel-token').should('be.null');
    // 10. El botón vuelve a estar habilitado
    cy.contains('button', 'Iniciar sesión').should('not.be.disabled');
  });

  it('CP-01.4 Autenticación válida redirige al panel de socios', () => {
    cy.adminCredentials().then(({ ADMIN_EMAIL, ADMIN_PASSWORD }) => {
      // 1. Escribir correo del administrador
      cy.get('input[type="email"]').type(ADMIN_EMAIL);
      // 2. Escribir contraseña
      cy.get('input[placeholder="••••••••"]').type(ADMIN_PASSWORD, { log: false });
    });
    // 3. Enviar formulario
    cy.contains('button', 'Iniciar sesión').click();
    // 4. URL esperada
    cy.url().should('eq', `${Cypress.config('baseUrl')}/socios`);
    // 5. Se guardó el token
    cy.window().its('localStorage').invoke('getItem', 'tempel-token').should('not.be.null');
    // 6. Encabezado de la página
    cy.get('h1').should('have.text', 'Socios');
    // 7. Logo del sidebar presente
    cy.get('aside img[alt="Tempel Training"]').should('be.visible');
    // 8. Rol mostrado en el header
    cy.get('header').should('contain.text', 'administrador');
    // 9. Botón de cerrar sesión presente
    cy.get('button[aria-label="Cerrar sesión"]').should('be.visible');
    // 10. Cerrar sesión y volver al login
    cy.get('button[aria-label="Cerrar sesión"]').click();
    cy.url().should('include', '/login');
  });
});
