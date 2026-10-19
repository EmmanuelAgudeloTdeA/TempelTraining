// CP-03 Formulario "Nuevo usuario": dropdown de roles, validaciones y registro exitoso.
describe('CP-03 Formulario de usuarios', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAdmin();
    cy.get('aside nav').contains('a', 'Usuarios').click();
    cy.url().should('include', '/usuarios');
  });

  it('CP-03.1 Dropdown de rol: opciones presentes y campo condicional de especialidad', () => {
    // 1. Abrir el modal
    cy.contains('button', 'Nuevo usuario').click();
    // 2. Título del modal
    cy.get('h2').should('have.text', 'Nuevo usuario');
    // 3. Dropdown presente con 3 opciones
    cy.get('select').should('be.visible').find('option').should('have.length', 3);
    // 4. Textos de las opciones del dropdown
    cy.get('select option').then(($options) => {
      const textos = [...$options].map((option) => option.textContent);
      expect(textos).to.deep.equal(['Administrador', 'Recepcionista', 'Entrenador']);
    });
    // 5. Valor por defecto
    cy.get('select').should('have.value', 'recepcionista');
    // 6. No se muestra especialidad para recepcionista
    cy.contains('label', 'Especialidad').should('not.exist');
    // 7. Seleccionar Entrenador
    cy.get('select').select('Entrenador').should('have.value', 'entrenador');
    // 8. Aparece el campo especialidad
    cy.contains('label', 'Especialidad').should('be.visible');
    cy.get('input[placeholder="Ej: Fuerza funcional"]').should('be.visible');
    // 9. Seleccionar Administrador y el campo desaparece
    cy.get('select').select('Administrador').should('have.value', 'administrador');
    cy.contains('label', 'Especialidad').should('not.exist');
    // 10. Cerrar el modal con Cancelar
    cy.contains('button', 'Cancelar').click();
    cy.get('h2').should('not.exist');
  });

  it('CP-03.2 Envío NO exitoso: muestra los mensajes de validación', () => {
    // 1. Abrir el modal
    cy.contains('button', 'Nuevo usuario').click();
    // 2. Enviar el formulario vacío
    cy.contains('button', 'Guardar usuario').click();
    // 3. Mensaje de nombre obligatorio
    cy.contains('El nombre es obligatorio.').should('be.visible');
    // 4. Mensaje de email obligatorio
    cy.contains('El email es obligatorio.').should('be.visible');
    // 5. Mensaje de contraseña corta
    cy.contains('La contraseña debe tener al menos 6 caracteres.').should('be.visible');
    // 6. CSS: los mensajes son rojos
    cy.contains('El nombre es obligatorio.').should('have.css', 'color', 'rgb(239, 68, 68)');
    // 7. Escribir nombre y email inválido
    cy.get('input[placeholder="Ej: Ana Torres"]').type('Usuario Prueba');
    cy.get('input[placeholder="nombre@tempel.com"]').type('correo-invalido@x');
    // 8. Contraseña corta
    cy.get('input[type="password"]').type('123');
    // 9. Elegir entrenador sin especialidad y enviar
    cy.get('select').select('Entrenador');
    cy.contains('button', 'Guardar usuario').click();
    // 10. Mensajes de email inválido, contraseña y especialidad
    cy.contains('El email no tiene un formato válido.').should('be.visible');
    cy.contains('La contraseña debe tener al menos 6 caracteres.').should('be.visible');
    cy.contains('La especialidad es obligatoria para entrenadores.').should('be.visible');
    // 11. El mensaje de nombre desapareció
    cy.contains('El nombre es obligatorio.').should('not.exist');
  });

  it('CP-03.3 Envío exitoso: crea un recepcionista y aparece en la tabla', () => {
    const email = `cypress.${Date.now()}@tempel.com`;

    // 1. Abrir el modal
    cy.contains('button', 'Nuevo usuario').click();
    // 2. Escribir nombre
    cy.get('input[placeholder="Ej: Ana Torres"]').type('Recepcionista Cypress');
    // 3. Escribir email único
    cy.get('input[placeholder="nombre@tempel.com"]').type(email);
    // 4. Escribir contraseña
    cy.get('input[type="password"]').type('Cypress2026!');
    // 5. Seleccionar el rol
    cy.get('select').select('Recepcionista');
    // 6. Validar valores del formulario
    cy.get('input[placeholder="nombre@tempel.com"]').should('have.value', email);
    // 7. Guardar
    cy.contains('button', 'Guardar usuario').click();
    // 8. Mensaje de éxito
    cy.contains('Usuario creado correctamente.').should('be.visible');
    // 9. CSS: el mensaje de éxito es verde (#22C55E)
    cy.contains('Usuario creado correctamente.').should('have.css', 'color', 'rgb(34, 197, 94)');
    // 10. El modal se cerró
    cy.contains('h2', 'Nuevo usuario').should('not.exist');
    // 11. El usuario aparece en la tabla
    cy.get('table tbody').contains('td', email).should('be.visible');
  });
});
