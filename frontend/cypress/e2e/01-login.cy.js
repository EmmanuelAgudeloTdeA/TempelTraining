describe('CP-01 Login - Tempel Training', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('CP-01.1 Valida título, URL, elementos presentes y estilos de la pantalla de login', () => {
    cy.title().should('eq', 'Tempel Training');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`);
    cy.get('img[alt="Tempel Training"]').should('be.visible').and('have.attr', 'src');
    cy.get('h1').should('have.text', 'Tempel Training');
    cy.get('h2').should('contain.text', 'Iniciar sesión');
    cy.get('input[type="email"]').should('be.visible').and('have.attr', 'placeholder', 'correo@tempel.com');
    cy.get('input[placeholder="••••••••"]').should('be.visible').and('have.attr', 'type', 'password');
    cy.contains('button', 'Iniciar sesión').should('be.visible').and('have.attr', 'type', 'submit');
    cy.contains('button', '¿Olvidaste tu contraseña?').should('be.visible');
    cy.get('body').should('have.css', 'font-family').and('include', 'Inter');
    cy.get('body').should('have.css', 'background-color', 'rgb(13, 15, 18)');
    cy.contains('button', 'Iniciar sesión')
      .should('have.css', 'background-color', 'rgb(41, 182, 246)')
      .and('have.css', 'color', 'rgb(255, 255, 255)');
    cy.get('h1').should('have.css', 'color', 'rgb(229, 231, 235)');
  });

  it('CP-01.2 Muestra/oculta la contraseña con el botón del ojo (actions)', () => {
    cy.get('input[type="email"]').type('demo@tempel.com');
    cy.get('input[type="email"]').should('have.value', 'demo@tempel.com');
    cy.get('input[placeholder="••••••••"]').type('secreto123');
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'password');
    cy.get('input[placeholder="••••••••"]').parent().find('button').click();
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'text');
    cy.get('input[placeholder="••••••••"]').should('have.value', 'secreto123');
    cy.get('input[placeholder="••••••••"]').parent().find('button').click();
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'password');
    cy.get('input[type="email"]').clear().should('have.value', '');
    cy.url().should('include', '/login');
  });

  it('CP-01.3 Autenticación NO válida muestra mensaje de error', () => {
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').type('noexiste@tempel.com');
    cy.get('input[placeholder="••••••••"]').type('ClaveIncorrecta1');
    cy.get('input[type="email"]').should('have.value', 'noexiste@tempel.com');
    cy.contains('button', 'Iniciar sesión').click();
    cy.contains('p', 'Credenciales inválidas.').should('be.visible');
    cy.contains('p', 'Credenciales inválidas.').should('have.css', 'color', 'rgb(239, 68, 68)');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`);
    cy.window().its('localStorage').invoke('getItem', 'tempel-token').should('be.null');
    cy.contains('button', 'Iniciar sesión').should('not.be.disabled');
  });

  it('CP-01.4 Autenticación válida redirige al panel de socios', () => {
    cy.adminCredentials().then(({ ADMIN_EMAIL, ADMIN_PASSWORD }) => {
      cy.get('input[type="email"]').type(ADMIN_EMAIL);
      cy.get('input[placeholder="••••••••"]').type(ADMIN_PASSWORD, { log: false });
    });
    cy.contains('button', 'Iniciar sesión').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/socios`);
    cy.window().its('localStorage').invoke('getItem', 'tempel-token').should('not.be.null');
    cy.get('h1').should('have.text', 'Socios');
    cy.get('aside img[alt="Tempel Training"]').should('be.visible');
    cy.get('header').should('contain.text', 'administrador');
    cy.get('button[aria-label="Cerrar sesión"]').should('be.visible');
    cy.get('button[aria-label="Cerrar sesión"]').click();
    cy.url().should('include', '/login');
  });
});
