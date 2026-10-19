// CP-02 Menú de navegación del administrador: ítems presentes, URLs y encabezados.
describe('CP-02 Navegación del sidebar (administrador)', () => {
  const menuAdmin = ['Usuarios', 'Socios', 'Membresías', 'Tienda', 'Ventas', 'Reservas', 'Reportes', 'Método'];

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAdmin();
  });

  it('CP-02.1 El menú muestra todas las opciones del rol y navega a cada página', () => {
    // 1. El sidebar está presente
    cy.get('aside nav').should('be.visible');
    // 2. Cantidad de ítems del menú
    cy.get('aside nav a').should('have.length', menuAdmin.length);
    // 3. Cada ítem del menú está presente con su texto
    menuAdmin.forEach((label) => {
      cy.get('aside nav').contains('a', label).should('be.visible');
    });
    // 4. Opción exclusiva de recepcionista NO aparece
    cy.get('aside nav').should('not.contain.text', 'Visitantes');
    // 5. Ir a Usuarios
    cy.get('aside nav').contains('a', 'Usuarios').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/usuarios`);
    cy.get('h1').should('have.text', 'Usuarios');
    // 6. Ir a Membresías
    cy.get('aside nav').contains('a', 'Membresías').click();
    cy.url().should('include', '/membresias');
    cy.get('h1').should('have.text', 'Membresías');
    // 7. Ir a Tienda
    cy.get('aside nav').contains('a', 'Tienda').click();
    cy.url().should('include', '/tienda');
    cy.get('h1').should('have.text', 'Tienda');
    // 8. Ir a Ventas
    cy.get('aside nav').contains('a', 'Ventas').click();
    cy.url().should('include', '/ventas');
    cy.get('h1').should('have.text', 'Registro de venta');
    // 9. El ítem activo tiene estilo resaltado (fondo de tarjeta #1C2126)
    cy.get('aside nav').contains('a', 'Ventas').should('have.css', 'background-color', 'rgb(28, 33, 38)');
    // 10. Volver a Socios
    cy.get('aside nav').contains('a', 'Socios').click();
    cy.url().should('include', '/socios');
    cy.get('h1').should('have.text', 'Socios');
  });

  it('CP-02.2 Header: buscador, notificaciones y datos del usuario', () => {
    // 1. Header presente
    cy.get('header').should('be.visible');
    // 2. Input de búsqueda presente
    cy.get('header input[placeholder="Buscar socios, productos, ventas..."]').should('be.visible');
    // 3. Escribir en el buscador (action)
    cy.get('header input').type('proteína');
    // 4. Validar valor escrito
    cy.get('header input').should('have.value', 'proteína');
    // 5. Botón de notificaciones presente
    cy.get('header button').first().should('be.visible');
    // 6. Rol del usuario
    cy.get('header').should('contain.text', 'administrador');
    // 7. Avatar con la inicial
    cy.get('header .rounded-full').should('have.length.at.least', 1);
    // 8. CSS: borde inferior del header (#2A2F36)
    cy.get('header').should('have.css', 'border-bottom-color', 'rgb(42, 47, 54)');
    // 9. CSS: fondo del sidebar (#0B0D10)
    cy.get('aside').should('have.css', 'background-color', 'rgb(11, 13, 16)');
    // 10. Tarjeta de estado del sistema
    cy.get('aside').should('contain.text', 'Gestión activa');
    // 11. Cerrar sesión
    cy.get('button[aria-label="Cerrar sesión"]').click();
    cy.url().should('include', '/login');
  });
});
