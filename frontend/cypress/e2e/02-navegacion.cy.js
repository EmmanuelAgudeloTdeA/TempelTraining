describe('CP-02 Navegación del sidebar (administrador)', () => {
  const menuAdmin = ['Usuarios', 'Socios', 'Membresías', 'Tienda', 'Ventas', 'Reservas', 'Reportes', 'Método'];

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAdmin();
  });

  it('CP-02.1 El menú muestra todas las opciones del rol y navega a cada página', () => {
    cy.get('aside nav').should('be.visible');
    cy.get('aside nav a').should('have.length', menuAdmin.length);
    menuAdmin.forEach((label) => {
      cy.get('aside nav').contains('a', label).should('be.visible');
    });
    cy.get('aside nav').should('not.contain.text', 'Visitantes');
    cy.get('aside nav').contains('a', 'Usuarios').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/usuarios`);
    cy.get('h1').should('have.text', 'Usuarios');
    cy.get('aside nav').contains('a', 'Membresías').click();
    cy.url().should('include', '/membresias');
    cy.get('h1').should('have.text', 'Membresías');
    cy.get('aside nav').contains('a', 'Tienda').click();
    cy.url().should('include', '/tienda');
    cy.get('h1').should('have.text', 'Tienda');
    cy.get('aside nav').contains('a', 'Ventas').click();
    cy.url().should('include', '/ventas');
    cy.get('h1').should('have.text', 'Registro de venta');
    cy.get('aside nav').contains('a', 'Ventas').should('have.css', 'background-color', 'rgb(28, 33, 38)');
    cy.get('aside nav').contains('a', 'Socios').click();
    cy.url().should('include', '/socios');
    cy.get('h1').should('have.text', 'Socios');
  });

  it('CP-02.2 Header: buscador, notificaciones y datos del usuario', () => {
    cy.get('header').should('be.visible');
    cy.get('header input[placeholder="Buscar socios, productos, ventas..."]').should('be.visible');
    cy.get('header input').type('proteína');
    cy.get('header input').should('have.value', 'proteína');
    cy.get('header button').first().should('be.visible');
    cy.get('header').should('contain.text', 'administrador');
    cy.get('header .rounded-full').should('have.length.at.least', 1);
    cy.get('header').should('have.css', 'border-bottom-color', 'rgb(42, 47, 54)');
    cy.get('aside').should('have.css', 'background-color', 'rgb(11, 13, 16)');
    cy.get('aside').should('contain.text', 'Gestión activa');
    cy.get('button[aria-label="Cerrar sesión"]').click();
    cy.url().should('include', '/login');
  });
});
