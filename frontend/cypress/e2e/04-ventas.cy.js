describe('CP-04 Registro de venta', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAdmin();
  });

  it('CP-04.1 Valida el dropdown de vendedores y el resumen de la venta', () => {
    cy.get('aside nav').contains('a', 'Ventas').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/ventas`);
    cy.get('h1').should('have.text', 'Registro de venta');
    cy.contains('label', 'Vendedor').should('be.visible');
    cy.get('select').should('be.visible').find('option').should('have.length.at.least', 1);
    cy.get('select option').first().should('have.text', 'Sin usuario');
    cy.get('select').should('have.value', 'Sin usuario');
    // Recepcionistas: código de 4 dígitos + nombre, p. ej. "0001 - Ana"
    cy.get('select option').not(':first').each(($option) => {
      expect($option.text()).to.match(/^\d{4} - .+/);
    });
    cy.contains('Total venta').should('be.visible');
    cy.contains('Total venta').next().should('have.text', '$0');
    cy.contains('Total venta').should('have.css', 'color', 'rgb(41, 182, 246)');
    cy.contains('button', 'Registrar venta')
      .should('be.visible')
      .and('have.css', 'background-color', 'rgb(41, 182, 246)');
    cy.get('select').select('Sin usuario').should('have.value', 'Sin usuario');
  });
});
