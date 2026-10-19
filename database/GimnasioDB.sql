/* =============================================================================
   Tempel Training — Script de creación de la base de datos GimnasioDB
   Motor: SQL Server 2016 o superior (incluye SQL Server Express)

   Ejecución: abre este archivo en SSMS o Azure Data Studio y ejecútalo completo
   (F5), o desde consola:
       sqlcmd -S localhost\SQLEXPRESS -E -i database\GimnasioDB.sql

   - Es idempotente: solo crea lo que no existe y nunca borra datos.
   - No depende de rutas de instalación: SQL Server ubica los archivos .mdf/.ldf
     en su carpeta por defecto.
   - Antes de ejecutarlo, cambia la contraseña del login en la sección 4
     (debe coincidir con DB_PASSWORD de backend/.env).
   ============================================================================= */

/* =============================================================================
   1. BASE DE DATOS
   ============================================================================= */
IF DB_ID('GimnasioDB') IS NULL
BEGIN
    CREATE DATABASE GimnasioDB;
    ALTER DATABASE GimnasioDB SET RECOVERY SIMPLE;
END
GO

USE GimnasioDB;
GO

/* =============================================================================
   2. TABLAS
   ============================================================================= */

/* -----------------------------------------------------------------------------
   usuarios — cuentas de acceso de todos los roles
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.usuarios (
        id              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_usuarios PRIMARY KEY,
        nombre          VARCHAR(255)      NOT NULL,
        email           VARCHAR(255)      NOT NULL CONSTRAINT UQ_usuarios_email UNIQUE,
        password        VARCHAR(255)      NOT NULL,  -- hash bcrypt
        rol             VARCHAR(20)       NOT NULL,
        fecha_registro  DATETIME          NOT NULL CONSTRAINT DF_usuarios_fecha_registro DEFAULT GETDATE(),
        CONSTRAINT CK_usuarios_rol CHECK (rol IN ('administrador', 'recepcionista', 'entrenador', 'cliente'))
    );
END
GO

/* -----------------------------------------------------------------------------
   socios — datos adicionales de los usuarios con rol 'cliente'
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.socios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.socios (
        id                INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_socios PRIMARY KEY,
        id_usuario        INT               NOT NULL CONSTRAINT UQ_socios_id_usuario UNIQUE,
        telefono          VARCHAR(50)       NULL,
        fecha_nacimiento  DATE              NULL,
        CONSTRAINT FK_socios_usuarios FOREIGN KEY (id_usuario) REFERENCES dbo.usuarios (id)
    );
END
GO

/* -----------------------------------------------------------------------------
   membresias — catálogo de planes
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.membresias', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.membresias (
        id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_membresias PRIMARY KEY,
        tipo           VARCHAR(20)       NOT NULL CONSTRAINT UQ_membresias_tipo UNIQUE,
        precio         DECIMAL(10,2)     NOT NULL,
        duracion_dias  INT               NOT NULL,
        CONSTRAINT CK_membresias_tipo CHECK (tipo IN ('mensual', 'trimestral', 'semestral', 'estudiante')),
        CONSTRAINT CK_membresias_precio CHECK (precio >= 0),
        CONSTRAINT CK_membresias_duracion CHECK (duracion_dias > 0)
    );
END
GO

/* -----------------------------------------------------------------------------
   membresias_socio — membresías asignadas a cada socio
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.membresias_socio', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.membresias_socio (
        id                          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_membresias_socio PRIMARY KEY,
        id_socio                    INT               NOT NULL,
        id_membresia                INT               NOT NULL,
        fecha_inicio                DATE              NOT NULL CONSTRAINT DF_membresias_socio_fecha_inicio DEFAULT CAST(GETDATE() AS DATE),
        fecha_fin                   DATE              NOT NULL,
        estado                      VARCHAR(20)       NOT NULL CONSTRAINT DF_membresias_socio_estado DEFAULT 'activa',
        validado_por_recepcionista  BIT               NOT NULL CONSTRAINT DF_membresias_socio_validado DEFAULT 0,
        CONSTRAINT FK_membresias_socio_socios FOREIGN KEY (id_socio) REFERENCES dbo.socios (id),
        CONSTRAINT FK_membresias_socio_membresias FOREIGN KEY (id_membresia) REFERENCES dbo.membresias (id),
        CONSTRAINT CK_membresias_socio_estado CHECK (estado IN ('activa', 'vencida', 'cancelada')),
        CONSTRAINT CK_membresias_socio_fechas CHECK (fecha_fin >= fecha_inicio)
    );

    CREATE INDEX IX_membresias_socio_socio_estado ON dbo.membresias_socio (id_socio, estado);
END
GO

/* -----------------------------------------------------------------------------
   productos — catálogo de la tienda
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.productos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.productos (
        id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_productos PRIMARY KEY,
        nombre     VARCHAR(255)      NOT NULL,
        categoria  VARCHAR(20)       NOT NULL,
        precio     DECIMAL(10,2)     NOT NULL,
        stock      INT               NOT NULL CONSTRAINT DF_productos_stock DEFAULT 0,
        CONSTRAINT CK_productos_categoria CHECK (categoria IN ('ropa', 'suplementos', 'accesorios', 'equipos')),
        CONSTRAINT CK_productos_precio CHECK (precio >= 0),
        CONSTRAINT CK_productos_stock CHECK (stock >= 0)
    );
END
GO

/* -----------------------------------------------------------------------------
   ventas — encabezado de cada venta (vendedor opcional: "Sin usuario" = NULL)
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.ventas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ventas (
        id                   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ventas PRIMARY KEY,
        id_usuario_vendedor  INT               NULL,
        fecha                DATETIME          NOT NULL CONSTRAINT DF_ventas_fecha DEFAULT GETDATE(),
        total                DECIMAL(10,2)     NOT NULL,
        CONSTRAINT FK_ventas_usuarios FOREIGN KEY (id_usuario_vendedor) REFERENCES dbo.usuarios (id),
        CONSTRAINT CK_ventas_total CHECK (total >= 0)
    );

    CREATE INDEX IX_ventas_fecha ON dbo.ventas (fecha);
END
GO

/* -----------------------------------------------------------------------------
   detalle_ventas — líneas de cada venta
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.detalle_ventas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.detalle_ventas (
        id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_detalle_ventas PRIMARY KEY,
        id_venta     INT               NOT NULL,
        id_producto  INT               NOT NULL,
        cantidad     INT               NOT NULL,
        subtotal     DECIMAL(10,2)     NOT NULL,
        CONSTRAINT FK_detalle_ventas_ventas FOREIGN KEY (id_venta) REFERENCES dbo.ventas (id) ON DELETE CASCADE,
        CONSTRAINT FK_detalle_ventas_productos FOREIGN KEY (id_producto) REFERENCES dbo.productos (id),
        CONSTRAINT CK_detalle_ventas_cantidad CHECK (cantidad > 0),
        CONSTRAINT CK_detalle_ventas_subtotal CHECK (subtotal >= 0)
    );
END
GO

/* -----------------------------------------------------------------------------
   entrenadores — datos adicionales de los usuarios con rol 'entrenador'
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.entrenadores', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.entrenadores (
        id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_entrenadores PRIMARY KEY,
        id_usuario    INT               NOT NULL CONSTRAINT UQ_entrenadores_id_usuario UNIQUE,
        especialidad  VARCHAR(255)      NOT NULL,
        CONSTRAINT FK_entrenadores_usuarios FOREIGN KEY (id_usuario) REFERENCES dbo.usuarios (id)
    );
END
GO

/* -----------------------------------------------------------------------------
   reservas — sesiones de entrenamiento socio-entrenador
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.reservas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.reservas (
        id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_reservas PRIMARY KEY,
        id_socio       INT               NOT NULL,
        id_entrenador  INT               NOT NULL,
        fecha          DATE              NOT NULL,
        hora           TIME(0)           NOT NULL,  -- el backend envía 'HH:MM'
        estado         VARCHAR(20)       NOT NULL CONSTRAINT DF_reservas_estado DEFAULT 'pendiente',
        CONSTRAINT FK_reservas_socios FOREIGN KEY (id_socio) REFERENCES dbo.socios (id),
        CONSTRAINT FK_reservas_entrenadores FOREIGN KEY (id_entrenador) REFERENCES dbo.entrenadores (id),
        CONSTRAINT CK_reservas_estado CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada'))
    );

    CREATE INDEX IX_reservas_fecha_hora ON dbo.reservas (fecha, hora);
END
GO

/* -----------------------------------------------------------------------------
   visitantes_dia — personas que ingresan con pase diario
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.visitantes_dia', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.visitantes_dia (
        id                INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_visitantes_dia PRIMARY KEY,
        nombre            VARCHAR(255)      NOT NULL,
        documento         VARCHAR(50)       NOT NULL,
        tipo_visitante    VARCHAR(10)       NOT NULL,
        nombre_acudiente  VARCHAR(255)      NULL,  -- se diligencia para niños
        fecha_registro    DATETIME          NOT NULL CONSTRAINT DF_visitantes_dia_fecha_registro DEFAULT GETDATE(),
        CONSTRAINT CK_visitantes_dia_tipo CHECK (tipo_visitante IN ('adulto', 'nino'))
    );

    CREATE INDEX IX_visitantes_dia_documento ON dbo.visitantes_dia (documento);
END
GO

/* -----------------------------------------------------------------------------
   asistencias_dia — cada ingreso de un visitante con su pase
   ----------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.asistencias_dia', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.asistencias_dia (
        id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_asistencias_dia PRIMARY KEY,
        id_visitante   INT               NOT NULL,
        fecha          DATETIME          NOT NULL CONSTRAINT DF_asistencias_dia_fecha DEFAULT GETDATE(),
        tipo_pase      VARCHAR(20)       NOT NULL CONSTRAINT DF_asistencias_dia_tipo_pase DEFAULT 'normal',
        precio_pagado  DECIMAL(10,2)     NOT NULL CONSTRAINT DF_asistencias_dia_precio DEFAULT 0,
        CONSTRAINT FK_asistencias_dia_visitantes FOREIGN KEY (id_visitante) REFERENCES dbo.visitantes_dia (id),
        CONSTRAINT CK_asistencias_dia_tipo_pase CHECK (tipo_pase IN ('normal', 'domingo_infantil')),
        CONSTRAINT CK_asistencias_dia_precio CHECK (precio_pagado >= 0)
    );

    CREATE INDEX IX_asistencias_dia_fecha ON dbo.asistencias_dia (fecha);
END
GO

/* =============================================================================
   3. DATOS SEMILLA
   ============================================================================= */

-- Planes de membresía (requeridos por la aplicación)
MERGE dbo.membresias AS destino
USING (VALUES
    ('mensual',     90000.00,  30),
    ('trimestral', 240000.00,  90),
    ('semestral',  450000.00, 180),
    ('estudiante',  70000.00,  30)
) AS origen (tipo, precio, duracion_dias)
ON destino.tipo = origen.tipo
WHEN NOT MATCHED THEN
    INSERT (tipo, precio, duracion_dias) VALUES (origen.tipo, origen.precio, origen.duracion_dias);
GO

-- Productos de ejemplo para la tienda (solo si la tabla está vacía)
IF NOT EXISTS (SELECT 1 FROM dbo.productos)
BEGIN
    INSERT INTO dbo.productos (nombre, categoria, precio, stock) VALUES
        ('Camiseta Dry-Fit Tempel',       'ropa',         65000.00, 40),
        ('Pantaloneta de entrenamiento',  'ropa',         55000.00, 30),
        ('Proteína Whey 2 lb',            'suplementos', 145000.00, 20),
        ('Creatina monohidratada 300 g',  'suplementos',  98000.00, 25),
        ('Guantes de levantamiento',      'accesorios',   45000.00, 35),
        ('Botella shaker 700 ml',         'accesorios',   25000.00, 50),
        ('Banda elástica de resistencia', 'equipos',      38000.00, 30),
        ('Mancuerna hexagonal 10 kg',     'equipos',     120000.00, 12);
END
GO

/* =============================================================================
   4. LOGIN Y USUARIO DE LA APLICACIÓN
   Crea el login que usa el backend (backend/.env → DB_USER / DB_PASSWORD) con
   permisos de lectura y escritura sobre GimnasioDB.
   Cambia @password antes de ejecutar; si se deja el valor de ejemplo, el login
   no se crea. Requiere autenticación mixta habilitada en SQL Server.
   ============================================================================= */
DECLARE @login    SYSNAME       = N'tempel_gimnasio';
DECLARE @password NVARCHAR(128) = N'CAMBIA_ESTA_CLAVE';

IF @password = N'CAMBIA_ESTA_CLAVE'
BEGIN
    PRINT 'AVISO: no se creó el login ' + @login + '. Cambia @password en la sección 4 y vuelve a ejecutar el script.';
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @login)
    BEGIN
        DECLARE @createLogin NVARCHAR(MAX) =
            N'CREATE LOGIN ' + QUOTENAME(@login) +
            N' WITH PASSWORD = N''' + REPLACE(@password, N'''', N'''''') + N''', CHECK_POLICY = OFF, DEFAULT_DATABASE = [GimnasioDB];';
        EXEC (@createLogin);
        PRINT 'Login ' + @login + ' creado.';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @login)
    BEGIN
        DECLARE @createUser NVARCHAR(MAX) = N'CREATE USER ' + QUOTENAME(@login) + N' FOR LOGIN ' + QUOTENAME(@login) + N' WITH DEFAULT_SCHEMA = [dbo];';
        EXEC (@createUser);
    END

    IF IS_ROLEMEMBER('db_datareader', @login) = 0
    BEGIN
        DECLARE @addReader NVARCHAR(MAX) = N'ALTER ROLE db_datareader ADD MEMBER ' + QUOTENAME(@login) + N';';
        EXEC (@addReader);
    END

    IF IS_ROLEMEMBER('db_datawriter', @login) = 0
    BEGIN
        DECLARE @addWriter NVARCHAR(MAX) = N'ALTER ROLE db_datawriter ADD MEMBER ' + QUOTENAME(@login) + N';';
        EXEC (@addWriter);
    END
END
GO

PRINT 'GimnasioDB lista.';
GO
