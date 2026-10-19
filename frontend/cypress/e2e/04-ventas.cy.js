// CP-04 Registro de venta: dropdown de vendedor, total y estilos.
describe('CP-04 Registro de venta', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAdmin();
  });

  it('CP-04.1 Valida el dropdown de vendedores y el resumen de la venta', () => {
    // 1. Navegar a Ventas desde el menú
    cy.get('aside nav').contains('a', 'Ventas').click();
    // 2. URL esperada
    cy.url().should('eq', `${Cypress.config('baseUrl')}/ventas`);
    // 3. Título del módulo
    cy.get('h1').should('have.text', 'Registro de venta');
    // 4. Label del dropdown
    cy.contains('label', 'Vendedor').should('be.visible');
    // 5. Dropdown presente con al menos la opción "Sin usuario"
    cy.get('select').should('be.visible').find('option').should('have.length.at.least', 1);
    // 6. La primera opción es "Sin usuario" y está seleccionada
    cy.get('select option').first().should('have.text', 'Sin usuario');
    cy.get('select').should('have.value', 'Sin usuario');
    // 7. Las opciones de recepcionistas tienen formato "0001 - Nombre"
    cy.get('select option').not(':first').each(($option) => {
      expect($option.text()).to.match(/^\d{4} - .+/);
    });
    // 8. Total inicial en $0
    cy.contains('Total venta').should('be.visible');
    cy.contains('Total venta').next().should('have.text', '$0');
    // 9. CSS: color del texto "Total venta" (#29B6F6)
    cy.contains('Total venta').should('have.css', 'color', 'rgb(41, 182, 246)');
    // 10. Botón "Registrar venta" presente con el color primario
    cy.contains('button', 'Registrar venta')
      .should('be.visible')
      .and('have.css', 'background-color', 'rgb(41, 182, 246)');
    // 11. Seleccionar de nuevo "Sin usuario" (action sobre el dropdown)
    cy.get('select').select('Sin usuario').should('have.value', 'Sin usuario');
  });
});
