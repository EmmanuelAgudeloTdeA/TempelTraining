# PROMPT PARA AGENTE DE VSCODE — Tempel Training

Copia y pega todo este documento como instrucción inicial al agente (Claude Code / Copilot Chat / Cursor, etc.) dentro de la carpeta vacía de tu proyecto.

---

## ESTADO ACTUAL DEL PROYECTO (leer primero)

Ya existe una carpeta `frontend/` en la raíz del proyecto, y dentro de ella ya existe la subcarpeta `frontend/design-reference/` con las 6 imágenes de referencia visual (Mockup_1 a Mockup_5 y Mockup_Tempel_Training). Fuera de esa subcarpeta, `frontend/` está completamente vacía: NO se ha corrido `npm create vite` ni existe ningún `package.json` todavía. La carpeta `backend/` no existe aún.

Por lo tanto:
- Inicializa el proyecto de Vite + React **dentro** de la carpeta `frontend/` ya existente (sin sobrescribir ni mover `design-reference/`).
- Crea la carpeta `backend/` desde cero con toda su estructura.

## CONTEXTO DEL PROYECTO

Vas a construir **Tempel Training**, una aplicación web full-stack de gestión de gimnasio con tienda integrada. Es un proyecto académico (Proyecto Pedagógico Integrador de 4to semestre de Ingeniería en Software) que debe verse y funcionar como una **aplicación web real, profesional y completa** — NO un mockup, NO una maqueta estática, NO una versión "de ejemplo" simplificada. Cada pantalla debe estar conectada a la base de datos real y ser completamente funcional (crear, leer, actualizar según corresponda).

## STACK TECNOLÓGICO (obligatorio, no cambiar)

**Backend:**
- Node.js + Express
- SQL Server como base de datos, conexión mediante el paquete `mssql`
- Autenticación con `bcrypt` (hash de contraseñas) + `jsonwebtoken` (JWT)
- `dotenv` para variables de entorno
- `cors`
- `nodemon` para desarrollo

**Frontend:**
- React con Vite
- Tailwind CSS (configurar paleta de colores personalizada, ver sección de diseño)
- `react-router-dom` para las rutas
- `axios` para las peticiones HTTP
- `lucide-react` para íconos (outline, delgados)
- `recharts` para las gráficas del módulo de reportes

## ESTRUCTURA DE CARPETAS

```
tempel-training/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── models/
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/       (para el estado de autenticación/rol)
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    └── package.json
```

## CONEXIÓN A LA BASE DE DATOS

La base de datos `GimnasioDB` YA EXISTE en SQL Server, con las 11 tablas ya creadas y con datos semilla de membresías. NO generes scripts de creación de base de datos ni migraciones — solo conéctate a ella.

Configura la conexión en `backend/.env` (usa este archivo como plantilla, yo completaré los valores reales localmente):

```
DB_SERVER=ANDRES-SC-DEV\SQLEXPRESS
DB_DATABASE=GimnasioDB
DB_USER=tempel_gimnasio
DB_PASSWORD=coloca_aqui_la_contraseña
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=coloca_aqui_un_secreto_largo
PORT=4000
```

Usa `mssql` con un pool de conexiones reutilizable en `backend/src/config/db.js`.

## ESQUEMA DE BASE DE DATOS (referencia exacta — no modificar nombres de tablas/columnas)

```sql
usuarios (id, nombre, email, password, rol, fecha_registro)
  -- rol: 'administrador' | 'recepcionista' | 'entrenador' | 'cliente'

socios (id, id_usuario, telefono, fecha_nacimiento)

membresias (id, tipo, precio, duracion_dias)
  -- tipo: 'mensual' | 'trimestral' | 'semestral' | 'estudiante'

membresias_socio (id, id_socio, id_membresia, fecha_inicio, fecha_fin, estado, validado_por_recepcionista)
  -- estado: 'activa' | 'vencida' | 'cancelada'

productos (id, nombre, categoria, precio, stock)
  -- categoria: 'ropa' | 'suplementos' | 'accesorios' | 'equipos'

ventas (id, id_usuario_vendedor [NULL permitido], fecha, total)

detalle_ventas (id, id_venta, id_producto, cantidad, subtotal)

entrenadores (id, id_usuario, especialidad)

reservas (id, id_socio, id_entrenador, fecha, hora, estado)
  -- estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

visitantes_dia (id, nombre, documento, tipo_visitante, nombre_acudiente, fecha_registro)
  -- tipo_visitante: 'adulto' | 'nino'

asistencias_dia (id, id_visitante, fecha, tipo_pase, precio_pagado)
  -- tipo_pase: 'normal' | 'domingo_infantil'
```

## SISTEMA DE DISEÑO (aplicar en TODA la interfaz, con consistencia total)

**Identidad de marca:** Tempel Training tiene un logo de una cabeza de lince en blanco/negro con resplandor azul eléctrico. La interfaz debe sentirse oscura, intensa, tecnológica y premium — como un dashboard SaaS moderno (referencia de calidad: Stripe Dashboard, Linear, Notion), NO como una plantilla genérica de Bootstrap.

**Paleta de colores (configúrala en `tailwind.config.js` como colores personalizados):**
```js
colors: {
  'tempel-bg': '#0D0F12',        // fondo principal
  'tempel-card': '#1C2126',      // fondo de tarjetas/paneles
  'tempel-border': '#2A2F36',    // bordes sutiles
  'tempel-blue': '#29B6F6',      // acento primario (azul hielo eléctrico)
  'tempel-text': '#E5E7EB',      // texto principal
  'tempel-muted': '#9CA3AF',     // texto secundario
  'estado-verde': '#22C55E',     // membresía al día (+5 días)
  'estado-amarillo': '#EAB308',  // 5-3 días
  'estado-naranja': '#F97316',   // 2-1 días
  'estado-rojo': '#EF4444',      // vencida
}
```

**Tipografía:** Inter (importar desde Google Fonts).

**Componentes base a reutilizar en toda la app:**
- Tarjetas con `bg-tempel-card`, borde `border border-tempel-border`, `rounded-xl`, sombra suave
- Botón primario: fondo `bg-tempel-blue`, texto blanco, `rounded-lg`, con `hover:shadow-[0_0_15px_rgba(41,182,246,0.5)]` (efecto glow sutil)
- Íconos delgados de `lucide-react` en el sidebar y encabezados de sección
- Badges de estado con punto de color + texto (ej: 🟢 "al día", 🟡 "5-3 días", 🟠 "2-1 días", 🔴 "vencida")

## LAYOUT GENERAL (aplica a todas las pantallas autenticadas)

- **Sidebar fijo a la izquierda** (fondo `tempel-bg`, un poco más oscuro que el contenido), con el logo de Tempel Training arriba, y debajo el menú de navegación con íconos + texto
- **Header superior** dentro del área de contenido: campo de búsqueda a la izquierda, ícono de notificaciones (campana) y avatar + nombre del usuario conectado a la derecha, con un pequeño dropdown al hacer clic (mostrar rol y opción de cerrar sesión)
- El **menú del sidebar cambia dinámicamente según el rol del usuario autenticado** (ver tabla de permisos abajo). Los ítems no disponibles para el rol simplemente NO se muestran (no los muestres deshabilitados con candado, ocúltalos directamente — más limpio en producción real).

## ROLES Y PERMISOS (control de acceso obligatorio en backend Y frontend)

| Rol | Ítems de menú visibles |
|---|---|
| Administrador | Socios, Membresías, Tienda, Ventas, Reservas, Reportes |
| Recepcionista | Socios, Membresías, Tienda, Ventas, Visitantes |
| Entrenador | Mis Reservas, Mis Socios |
| Socio (cliente) | Mi Perfil, Mi Membresía, Tienda, Reservar Entrenamiento |

El backend debe validar el rol en cada endpoint protegido usando `roleMiddleware` (no basta con ocultar el botón en el frontend — cada ruta debe rechazar con 403 si el rol no tiene permiso).

## PANTALLAS A CONSTRUIR (con referencia visual)

Voy a colocar 6 imágenes de referencia en la carpeta `frontend/design-reference/` (Mockup_1 a Mockup_5 y Mockup_Tempel_Training). Antes de construir cada pantalla, revisa la imagen correspondiente para replicar fielmente la disposición de elementos, no solo los colores.

### 1. Login (`/login`) — referencia: Mockup_1 (mitad izquierda)
Pantalla centrada con logo grande arriba, campo "Correo electrónico", campo "Contraseña", botón "Iniciar sesión" (azul con glow), link "¿Olvidaste tu contraseña?" debajo. Al autenticar, guarda el JWT y redirige según el rol.

### 2. Socios — listado (`/socios`) — referencia: Mockup_1 (mitad derecha)
Tabla con columnas Nombre (avatar + nombre), Membresía, Estado (badge de color según días para vencimiento). Barra de búsqueda y botón "+ Nuevo socio". Al hacer clic en un socio, navega a su perfil individual.
**Lógica del indicador de vencimiento:** calcular `fecha_fin - fecha_actual` desde `membresias_socio`: más de 5 días = verde, 5 a 3 = amarillo, 2 a 1 = naranja, 0 o vencida = rojo.

### 3. Perfil individual del socio (`/socios/:id`) — referencia: Mockup_4
Tarjeta superior con avatar, nombre completo, badge del plan de membresía, teléfono. Debajo, un **anillo circular grande de progreso** (usa `recharts` con un `RadialBarChart` o SVG custom) mostrando "X DÍAS RESTANTES" con el color correspondiente al estado, y debajo una leyenda con los 4 estados. Más abajo, dos tarjetas lado a lado: "Historial de pagos" y "Reservas recientes".

### 4. Membresías (`/membresias`)
CRUD de los 4 planes (mensual, trimestral, semestral, estudiante) — solo Administrador. Desde el perfil de un socio también se debe poder asignar/renovar membresía (con el checkbox de validación si es plan estudiante).

### 5. Tienda / Catálogo (`/tienda`) — referencia: Mockup_2 (mitad izquierda)
Filtros por categoría como píldoras/tabs arriba (Todo, Ropa deportiva, Suplementos, Accesorios, Equipos). Grid de tarjetas de producto con imagen, nombre, categoría, precio en azul, stock disponible. Administrador puede crear/editar/eliminar productos desde aquí (botón adicional visible solo para su rol).

### 6. Registro de venta (`/ventas/nueva`) — referencia: Mockup_2 (mitad derecha)
Lista de productos agregados con miniatura, cantidad y subtotal (botón para quitar cada línea). Barra destacada "TOTAL VENTA: $X" en azul. Dropdown "Vendedor" que consulta a la API y lista SOLO usuarios con rol `recepcionista` en formato "0001 - Nombre Completo", con una opción final fija "Sin usuario" que envía `NULL`. Botón "Registrar venta" que hace la petición al backend (inserta en `ventas` + `detalle_ventas` + descuenta stock, todo en una transacción).

### 7. Reservas (`/reservas`) — referencia: Mockup_3 (mitad izquierda)
Vista de agenda semanal (Lunes a Domingo, franjas horarias en la columna izquierda). Las reservas confirmadas se muestran como bloques de color dentro de la grilla con nombre del entrenador y del socio. Botón "+ Nueva reserva" arriba a la derecha. El socio ve solo sus propias reservas; el entrenador ve las suyas asignadas con opción de confirmar/cancelar; el administrador/recepcionista ve todas.

### 8. Visitantes / Pase diario (`/visitantes`) — solo Recepcionista y Administrador
Formulario para registrar un visitante nuevo o buscar uno existente por documento, seleccionar tipo de pase (normal / domingo infantil), y registrar la asistencia. Debe mostrar también un listado/historial simple de visitas.

### 9. Reportes (`/reportes`) — referencia: Mockup_3 (mitad derecha) — solo Administrador
4 tarjetas de métricas: Ventas del mes (con variación % vs mes anterior y gráfico de línea), Socios activos (con variación % y gráfico de barras), Membresías por vencer, Visitantes de pase diario. Usa `recharts` para los mini-gráficos, en tonos azul eléctrico sobre fondo oscuro.

### 10. Sección informativa "Método de entrenamiento" (`/metodo`)
Contenido **100% estático** (sin conexión a base de datos): tarjetas o acordeón explicando las semanas de fuerza, resistencia, y la división de grupos musculares por día. Este texto va hardcodeado en un componente React, tú puedes redactar un contenido de ejemplo razonable.

## FLUJO DE AUTENTICACIÓN

1. Login → backend valida credenciales contra `usuarios` (password comparado con bcrypt) → genera JWT con `{ id, rol }` → frontend guarda el token (en memoria/contexto de React, no localStorage por buenas prácticas, o localStorage si prefieres simplicidad para el entorno académico)
2. Cada petición al backend incluye el token en el header `Authorization: Bearer <token>`
3. `authMiddleware` valida el token; `roleMiddleware(['administrador', 'recepcionista'])` valida que el rol tenga permiso sobre esa ruta específica
4. El frontend usa un `AuthContext` para saber el rol actual y renderizar el sidebar/rutas correspondientes; usa rutas protegidas con `react-router-dom` que redirigen a `/login` si no hay sesión

## ORDEN DE CONSTRUCCIÓN SUGERIDO

1. Backend: configuración de conexión a BD + estructura de carpetas + autenticación (login, middlewares)
2. Backend: endpoints de socios, membresías, productos, ventas, reservas, visitantes, reportes (CRUD según corresponda a cada uno)
3. Frontend: configuración de Tailwind con la paleta personalizada + estructura de rutas + AuthContext + Login
4. Frontend: Layout general (sidebar dinámico por rol + header)
5. Frontend: pantalla por pantalla, en este orden: Socios → Perfil de socio → Membresías → Tienda → Registro de venta → Reservas → Visitantes → Reportes → Método de entrenamiento
6. Pruebas manuales de flujo completo con los 4 roles

## IMPORTANTE

- No inventes tablas ni columnas adicionales a las 11 ya definidas.
- Todas las pantallas deben consumir datos reales desde el backend (nada de datos mock/hardcodeados excepto la sección "Método de entrenamiento").
- Prioriza que la aplicación corra sin errores de extremo a extremo antes que pulir detalles visuales menores.
- Si algo del alcance no queda claro, pregunta antes de asumir.
