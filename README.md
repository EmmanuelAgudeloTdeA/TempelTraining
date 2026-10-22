<p align="center">
  <img src="frontend/src/assets/LogoTempelTraining.png" alt="Tempel Training" width="160" />
</p>

<h1 align="center">Tempel Training</h1>

<p align="center">
  Aplicación web full-stack para la gestión de un gimnasio con tienda integrada.<br />
  Proyecto Pedagógico Integrador — 4.º semestre de Ingeniería en Software (TdeA).
</p>

---

## Contenido

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Roles y permisos](#roles-y-permisos)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Pruebas E2E con Cypress](#pruebas-e2e-con-cypress)
- [API](#api)

## Descripción

Tempel Training centraliza la operación diaria de un gimnasio: socios y sus membresías, venta de productos, reservas con entrenadores, control de visitantes con pase diario y reportes para la administración. Cada rol ve solo los módulos que le corresponden, y el backend valida los permisos en cada endpoint.

## Funcionalidades

| Módulo | Descripción |
|---|---|
| **Login** | Autenticación con JWT. Si no existe administrador, permite crear el primero. |
| **Usuarios** | Alta y edición del personal interno (administrador, recepcionista, entrenador). |
| **Socios** | Listado con buscador e indicador de vencimiento de membresía por colores. |
| **Perfil del socio** | Anillo de días restantes, historial de pagos y reservas recientes. |
| **Membresías** | Planes mensual, trimestral, semestral y estudiante; asignación y renovación. |
| **Tienda** | Catálogo por categorías (ropa, suplementos, accesorios, equipos). |
| **Ventas** | Registro de venta con detalle, total y vendedor (recepcionista o "Sin usuario"). |
| **Reservas** | Agenda semanal de sesiones con entrenadores. |
| **Visitantes** | Registro de pase diario (normal / domingo infantil) e historial. |
| **Reportes** | Métricas de ventas, socios activos, membresías por vencer y visitantes. |
| **Método** | Sección informativa sobre el método de entrenamiento. |

**Indicador de vencimiento de membresía:**
🟢 más de 5 días · 🟡 5 a 3 días · 🟠 2 a 1 días · 🔴 vencida

## Roles y permisos

| Rol | Módulos |
|---|---|
| Administrador | Usuarios, Socios, Membresías, Tienda, Ventas, Reservas, Reportes, Método |
| Recepcionista | Socios, Membresías, Tienda, Ventas, Visitantes, Método |
| Entrenador | Mis Reservas, Mis Socios, Método |
| Cliente (socio) | Mi Perfil, Mi Membresía, Tienda, Reservar Entrenamiento, Método |

## Stack tecnológico

**Backend:** Node.js · Express · SQL Server (`mssql`) · JWT (`jsonwebtoken`) · `bcrypt` · `dotenv` · `nodemon` · Jest

**Frontend:** React 19 · Vite · Tailwind CSS · React Router · Axios · Recharts · Lucide

**Pruebas E2E:** Cypress

## Estructura del repositorio

```
TempelTraining/
├── database/
│   └── GimnasioDB.sql       Creación de la BD, 11 tablas y datos semilla
│
├── backend/                 API REST (puerto 4000)
│   ├── server.js            Punto de entrada
│   ├── src/
│   │   ├── config/db.js     Pool de conexión a SQL Server
│   │   ├── routes/          authRoutes, gymRoutes
│   │   ├── controllers/     Lógica de negocio y consultas
│   │   └── middlewares/     authMiddleware (JWT), roleMiddleware (roles)
│   ├── tests-actividad/     Pruebas unitarias con Jest
│   └── .env.example         Plantilla de variables de entorno
│
└── frontend/                SPA React (puerto 5173)
    ├── src/
    │   ├── pages/           Una página por módulo
    │   ├── components/      AppLayout (sidebar + header), StatusBadge
    │   ├── context/         AuthContext (sesión y rol)
    │   └── services/api.js  Cliente Axios hacia la API
    ├── cypress/             Pruebas E2E
    ├── design-reference/    Mockups de diseño
    └── cypress.config.js
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior
- SQL Server (Express sirve) con:
  - Autenticación SQL (modo mixto) habilitada y TCP/IP activo en el puerto 1433
  - [SSMS](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms) o `sqlcmd` para ejecutar el script de la base de datos

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd TempelTraining
```

### 2. Base de datos

Ejecuta `database/GimnasioDB.sql` en SSMS (abrir el archivo y presionar F5) o desde consola:

```bash
sqlcmd -S localhost\SQLEXPRESS -E -i database/GimnasioDB.sql
```

El script crea la base `GimnasioDB`, las 11 tablas (`usuarios`, `socios`, `membresias`, `membresias_socio`, `productos`, `ventas`, `detalle_ventas`, `entrenadores`, `reservas`, `visitantes_dia`, `asistencias_dia`) con sus llaves y restricciones, y carga los 4 planes de membresía y 8 productos de ejemplo. Se puede ejecutar varias veces sin borrar datos.

La sección 4 del script crea el login SQL `tempel_gimnasio` que usa el backend, con permisos de lectura y escritura. Antes de ejecutarlo cambia `@password` por la misma contraseña que pondrás en `DB_PASSWORD`; si la dejas como `CAMBIA_ESTA_CLAVE`, el login no se crea.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env    # en PowerShell: Copy-Item .env.example .env
```

Edita `backend/.env` con los datos de tu SQL Server:

```env
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=GimnasioDB
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=pega_aqui_el_secreto_generado
PORT=4000
```

`JWT_SECRET` es la clave con la que el backend firma los tokens de sesión. Cada `.env` necesita una propia, aleatoria y larga; nunca se sube al repositorio. Para generarla (funciona en macOS, Linux y Windows):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
npm run dev
```

Verifica en <http://localhost:4000/api/health>. En consola debe aparecer `Conexión a SQL Server establecida correctamente.`

### 4. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre <http://localhost:5173>.

### 5. Primer ingreso

Si la tabla `usuarios` no tiene un administrador, la pantalla de login muestra el botón **"Crear primer administrador"**. Con esa cuenta puedes crear el resto del personal desde **Usuarios**. Los socios creados por el sistema reciben la contraseña temporal `Tempel2026!` y deben cambiarla al ingresar.

## Pruebas E2E con Cypress

Las pruebas viven en `frontend/cypress/e2e/` y se ejecutan contra la aplicación local (`http://localhost:5173`).

| Archivo | Casos | Qué valida |
|---|---|---|
| `01-login.cy.js` | CP-01.1 – CP-01.4 | Título, URL, logo, inputs, botones, estilos CSS, mostrar/ocultar contraseña, login inválido y válido |
| `02-navegacion.cy.js` | CP-02.1 – CP-02.2 | Ítems del menú lateral por rol, navegación, URLs, header y estilos |
| `03-usuarios-formulario.cy.js` | CP-03.1 – CP-03.3 | Dropdown de roles, mensajes de validación (no exitoso) y creación de usuario (exitoso) |
| `04-ventas.cy.js` | CP-04.1 | Dropdown de vendedores, total de la venta y estilos |

### Configuración

1. Ten el backend y el frontend corriendo (ver sección anterior).
2. Crea `frontend/cypress.env.json` a partir de la plantilla, con un administrador real:

   ```json
   {
     "ADMIN_EMAIL": "admin@tempel.com",
     "ADMIN_PASSWORD": "tu_contraseña"
   }
   ```

   Este archivo está en `.gitignore` y no se sube al repositorio.

### Ejecución

```bash
cd frontend
npm run cy:open   # interfaz gráfica de Cypress
npm run cy:run    # modo headless en consola
```

> **Nota:** CP-03.3 crea un usuario real en la base de datos en cada ejecución (con un email único `cypress.<timestamp>@tempel.com`).

## API

Base: `http://localhost:4000/api`. Todas las rutas, salvo las de autenticación pública, requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Roles |
|---|---|---|
| `POST` | `/auth/login` | Público |
| `GET` | `/auth/bootstrap-status` · `POST` `/auth/bootstrap-admin` | Público |
| `GET` | `/auth/me` · `POST` `/auth/change-password` | Autenticado |
| `GET` `POST` `PUT` | `/usuarios` | Administrador |
| `GET` | `/socios`, `/socios/:id` | Autenticado |
| `POST` | `/socios` | Administrador, Recepcionista |
| `GET` | `/membresias` | Autenticado |
| `POST` `PUT` `DELETE` | `/membresias` | Administrador |
| `POST` | `/membresias/asignar` | Administrador, Recepcionista |
| `GET` | `/productos` | Autenticado |
| `POST` `PUT` `DELETE` | `/productos` | Administrador, Recepcionista |
| `GET` | `/ventas` | Autenticado |
| `POST` | `/ventas` | Administrador, Recepcionista |
| `GET` `POST` `PUT` | `/reservas` | Autenticado |
| `GET` `POST` | `/visitantes` | Administrador, Recepcionista |
| `GET` | `/reportes` | Administrador |
| `GET` | `/usuarios/recepcionistas` | Administrador, Recepcionista |
