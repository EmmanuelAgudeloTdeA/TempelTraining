Cypress.Commands.add('loginUI', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[placeholder="••••••••"]').clear().type(password, { log: false });
  cy.contains('button', 'Iniciar sesión').click();
});

// Lee las credenciales del administrador desde cypress.env.json.
Cypress.Commands.add('adminCredentials', () => {
  return cy.env(['ADMIN_EMAIL', 'ADMIN_PASSWORD'], { log: false }).then((credentials) => {
    if (!credentials.ADMIN_EMAIL || !credentials.ADMIN_PASSWORD) {
      throw new Error('Faltan ADMIN_EMAIL / ADMIN_PASSWORD. Copia cypress.env.example.json a cypress.env.json y complétalo.');
    }
    return credentials;
  });
});

Cypress.Commands.add('loginAdmin', () => {
  cy.adminCredentials().then(({ ADMIN_EMAIL, ADMIN_PASSWORD }) => {
    cy.loginUI(ADMIN_EMAIL, ADMIN_PASSWORD);
  });
  cy.url().should('include', '/socios');
});
