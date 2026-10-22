describe('CP-03 Formulario de usuarios', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAdmin();
    cy.get('aside nav').contains('a', 'Usuarios').click();
    cy.url().should('include', '/usuarios');
  });

  it('CP-03.1 Dropdown de rol: opciones presentes y campo condicional de especialidad', () => {
    cy.contains('button', 'Nuevo usuario').click();
    cy.get('h2').should('have.text', 'Nuevo usuario');
    cy.get('select').should('be.visible').find('option').should('have.length', 3);
    cy.get('select option').then(($options) => {
      const textos = [...$options].map((option) => option.textContent);
      expect(textos).to.deep.equal(['Administrador', 'Recepcionista', 'Entrenador']);
    });
    cy.get('select').should('have.value', 'recepcionista');
    cy.contains('label', 'Especialidad').should('not.exist');
    cy.get('select').select('Entrenador').should('have.value', 'entrenador');
    cy.contains('label', 'Especialidad').should('be.visible');
    cy.get('input[placeholder="Ej: Fuerza funcional"]').should('be.visible');
    cy.get('select').select('Administrador').should('have.value', 'administrador');
    cy.contains('label', 'Especialidad').should('not.exist');
    cy.contains('button', 'Cancelar').click();
    cy.get('h2').should('not.exist');
  });

  it('CP-03.2 Envío NO exitoso: muestra los mensajes de validación', () => {
    cy.contains('button', 'Nuevo usuario').click();
    cy.contains('button', 'Guardar usuario').click();
    cy.contains('El nombre es obligatorio.').should('be.visible');
    cy.contains('El email es obligatorio.').should('be.visible');
    cy.contains('La contraseña debe tener al menos 6 caracteres.').should('be.visible');
    cy.contains('El nombre es obligatorio.').should('have.css', 'color', 'rgb(239, 68, 68)');
    cy.get('input[placeholder="Ej: Ana Torres"]').type('Usuario Prueba');
    cy.get('input[placeholder="nombre@tempel.com"]').type('correo-invalido@x');
    cy.get('input[type="password"]').type('123');
    cy.get('select').select('Entrenador');
    cy.contains('button', 'Guardar usuario').click();
    cy.contains('El email no tiene un formato válido.').should('be.visible');
    cy.contains('La contraseña debe tener al menos 6 caracteres.').should('be.visible');
    cy.contains('La especialidad es obligatoria para entrenadores.').should('be.visible');
    cy.contains('El nombre es obligatorio.').should('not.exist');
  });

  it('CP-03.3 Envío exitoso: crea un recepcionista y aparece en la tabla', () => {
    const email = `cypress.${Date.now()}@tempel.com`;

    cy.contains('button', 'Nuevo usuario').click();
    cy.get('input[placeholder="Ej: Ana Torres"]').type('Recepcionista Cypress');
    cy.get('input[placeholder="nombre@tempel.com"]').type(email);
    cy.get('input[type="password"]').type('Cypress2026!');
    cy.get('select').select('Recepcionista');
    cy.get('input[placeholder="nombre@tempel.com"]').should('have.value', email);
    cy.contains('button', 'Guardar usuario').click();
    cy.contains('Usuario creado correctamente.').should('be.visible');
    cy.contains('Usuario creado correctamente.').should('have.css', 'color', 'rgb(34, 197, 94)');
    cy.contains('h2', 'Nuevo usuario').should('not.exist');
    cy.get('table tbody').contains('td', email).should('be.visible');
  });
});
