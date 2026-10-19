const bcrypt = require('bcrypt');
const { getPool, sql } = require('../config/db');

function formatMemberStatus(daysRemaining) {
  const remainingDays = Number(daysRemaining);

  if (daysRemaining === null || daysRemaining === undefined || Number.isNaN(remainingDays)) {
    return { label: 'Sin membresía', color: 'red' };
  }

  if (remainingDays > 5) return { label: 'Al día', color: 'green' };
  if (remainingDays >= 3 && remainingDays <= 5) return { label: '5-3 días', color: 'yellow' };
  if (remainingDays >= 1 && remainingDays <= 2) return { label: '2-1 días', color: 'orange' };
  return { label: 'Vencida', color: 'red' };
}

async function listUsuarios(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, nombre, email, rol, fecha_registro
      FROM usuarios
      WHERE rol IN ('administrador', 'recepcionista', 'entrenador')
      ORDER BY fecha_registro DESC
    `);

    return res.json(result.recordset);
  } catch (error) {
    console.error('listUsuarios error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los usuarios.' });
  }
}

async function updateUsuario(req, res) {
  const { id } = req.params;
  const { nombre, email, password, rol, especialidad } = req.body || {};

  if (!nombre || !email || !rol) {
    return res.status(400).json({ message: 'Nombre, email y rol son obligatorios.' });
  }

  const allowedRoles = ['administrador', 'recepcionista', 'entrenador'];
  if (!allowedRoles.includes(rol)) {
    return res.status(400).json({ message: 'El rol no es válido.' });
  }

  if (rol === 'entrenador' && !especialidad) {
    return res.status(400).json({ message: 'La especialidad es obligatoria para entrenadores.' });
  }

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const queryParts = [
        'UPDATE usuarios SET nombre = @nombre, email = @email, rol = @rol'
      ];
      const request = new sql.Request(transaction)
        .input('id', sql.Int, Number(id))
        .input('nombre', sql.VarChar(255), nombre)
        .input('email', sql.VarChar(255), email)
        .input('rol', sql.VarChar(50), rol);

      if (password) {
        queryParts.push(', password = @password');
        request.input('password', sql.VarChar(255), await bcrypt.hash(password, 10));
      }

      queryParts.push(' WHERE id = @id');
      await request.query(queryParts.join(' '));

      if (rol === 'entrenador') {
        const trainerRes = await new sql.Request(transaction)
          .input('id_usuario', sql.Int, Number(id))
          .query('SELECT id FROM entrenadores WHERE id_usuario = @id_usuario');

        if (trainerRes.recordset[0]) {
          await new sql.Request(transaction)
            .input('id_usuario', sql.Int, Number(id))
            .input('especialidad', sql.VarChar(255), especialidad)
            .query('UPDATE entrenadores SET especialidad = @especialidad WHERE id_usuario = @id_usuario');
        } else {
          await new sql.Request(transaction)
            .input('id_usuario', sql.Int, Number(id))
            .input('especialidad', sql.VarChar(255), especialidad)
            .query('INSERT INTO entrenadores (id_usuario, especialidad) VALUES (@id_usuario, @especialidad)');
        }
      }

      await transaction.commit();
      return res.json({ message: 'Usuario actualizado correctamente.' });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('updateUsuario error:', error);
    return res.status(500).json({ message: 'No se pudo actualizar el usuario.' });
  }
}

async function createUsuario(req, res) {
  const { nombre, email, password, rol, especialidad } = req.body || {};

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: 'Nombre, email, contraseña y rol son obligatorios.' });
  }

  const allowedRoles = ['administrador', 'recepcionista', 'entrenador'];
  if (!allowedRoles.includes(rol)) {
    return res.status(400).json({ message: 'El rol debe ser administrador, recepcionista o entrenador.' });
  }

  if (rol === 'entrenador' && !especialidad) {
    return res.status(400).json({ message: 'La especialidad es obligatoria para entrenadores.' });
  }

  try {
    const pool = await getPool();
    const hashedPassword = await bcrypt.hash(password, 10);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const userResult = await new sql.Request(transaction)
        .input('nombre', sql.VarChar(255), nombre)
        .input('email', sql.VarChar(255), email)
        .input('password', sql.VarChar(255), hashedPassword)
        .input('rol', sql.VarChar(50), rol)
        .query(`
          INSERT INTO usuarios (nombre, email, password, rol, fecha_registro)
          OUTPUT INSERTED.id
          VALUES (@nombre, @email, @password, @rol, GETDATE())
        `);

      const userId = userResult.recordset[0].id;

      if (rol === 'entrenador') {
        await new sql.Request(transaction)
          .input('id_usuario', sql.Int, userId)
          .input('especialidad', sql.VarChar(255), especialidad)
          .query(`
            INSERT INTO entrenadores (id_usuario, especialidad)
            VALUES (@id_usuario, @especialidad)
          `);
      }

      await transaction.commit();
      return res.status(201).json({ message: 'Usuario creado correctamente.' });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('createUsuario error:', error);
    return res.status(500).json({ message: 'No se pudo crear el usuario.' });
  }
}

async function listSocios(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        s.id,
        u.nombre,
        u.email,
        s.telefono,
        m.tipo AS membresia,
        ms.fecha_fin,
        DATEDIFF(day, GETDATE(), ms.fecha_fin) AS dias_restantes,
        ms.estado,
        u.rol
      FROM socios s
      INNER JOIN usuarios u ON u.id = s.id_usuario
      LEFT JOIN membresias_socio ms ON ms.id_socio = s.id AND ms.estado = 'activa'
      LEFT JOIN membresias m ON m.id = ms.id_membresia
      ORDER BY u.nombre ASC
    `);

    const data = result.recordset.map((row) => ({
      ...row,
      status: formatMemberStatus(row.dias_restantes)
    }));

    return res.json(data);
  } catch (error) {
    console.error('listSocios error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los socios.' });
  }
}

async function getSocioById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        SELECT
          s.id,
          s.id_usuario,
          u.nombre,
          u.email,
          s.telefono,
          s.fecha_nacimiento,
          ms.id AS id_membresia_socio,
          m.tipo AS membresia,
          ms.fecha_inicio,
          ms.fecha_fin,
          ms.estado,
          ms.validado_por_recepcionista,
          DATEDIFF(day, GETDATE(), ms.fecha_fin) AS dias_restantes
        FROM socios s
        INNER JOIN usuarios u ON u.id = s.id_usuario
        LEFT JOIN membresias_socio ms ON ms.id_socio = s.id AND ms.estado = 'activa'
        LEFT JOIN membresias m ON m.id = ms.id_membresia
        WHERE s.id = @id
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Socio no encontrado.' });
    }

    const row = result.recordset[0];
    return res.json({
      ...row,
      status: formatMemberStatus(row.dias_restantes)
    });
  } catch (error) {
    console.error('getSocioById error:', error);
    return res.status(500).json({ message: 'No se pudo obtener el perfil del socio.' });
  }
}

async function createSocio(req, res) {
  const { nombre, email: providedEmail, password, telefono, fecha_nacimiento, rol = 'cliente' } = req.body || {};

  if (!nombre) {
    return res.status(400).json({ message: 'Nombre es obligatorio para el socio.' });
  }

  try {
    const pool = await getPool();
    // Generate or validate email
    let email = (providedEmail || '').trim();

    // helper to normalize strings for email
    const normalizeForEmail = (str) => {
      if (!str) return '';
      // remove diacritics, toLower, replace non-alpha with ''
      const cleaned = str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
      return cleaned.toLowerCase().replace(/[^a-z0-9 ]+/g, '');
    };

    if (!email) {
      // Build base from first and last name
      const parts = nombre.trim().split(/\s+/).filter(Boolean);
      let first = parts[0] || 'usuario';
      let last = parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'usuario';
      first = normalizeForEmail(first);
      last = normalizeForEmail(last);
      let base = `${first}.${last}`.replace(/\s+/g, '.');
      if (!base || base === '.') base = 'usuario';

      // find existing emails with this base
      const likePattern = `${base}%@tempel.com`;
      const existing = await pool.request()
        .input('like', sql.VarChar(255), likePattern)
        .query('SELECT email FROM usuarios WHERE email LIKE @like');

      const taken = new Set(existing.recordset.map(r => (r.email || '').toLowerCase()));

      // choose unique email
      let candidate = `${base}@tempel.com`;
      let suffix = 1;
      while (taken.has(candidate.toLowerCase())) {
        candidate = `${base}${suffix}@tempel.com`;
        suffix += 1;
      }

      email = candidate;
    } else {
      // validate provided email format and uniqueness
      email = email.toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'El email proporcionado no tiene un formato válido.' });
      }

      const exists = await pool.request()
        .input('email', sql.VarChar(255), email)
        .query('SELECT TOP 1 id FROM usuarios WHERE LOWER(email) = LOWER(@email)');

      if (exists.recordset.length > 0) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
      }
    }

    const generatedPassword = password || 'Tempel2026!';
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const userRes = await new sql.Request(transaction)
        .input('nombre', sql.VarChar(255), nombre)
        .input('email', sql.VarChar(255), email)
        .input('password', sql.VarChar(255), hashedPassword)
        .input('rol', sql.VarChar(50), rol)
        .query(`
          INSERT INTO usuarios (nombre, email, password, rol, fecha_registro)
          OUTPUT INSERTED.id
          VALUES (@nombre, @email, @password, @rol, GETDATE())
        `);

      const idUsuario = userRes.recordset[0].id;

      await new sql.Request(transaction)
        .input('id_usuario', sql.Int, idUsuario)
        .input('telefono', sql.VarChar(50), telefono || '')
        .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
        .query(`
          INSERT INTO socios (id_usuario, telefono, fecha_nacimiento)
          VALUES (@id_usuario, @telefono, @fecha_nacimiento)
        `);

      await transaction.commit();
      return res.status(201).json({
        message: 'Socio creado correctamente.',
        email,
        password: generatedPassword,
        mustChangePassword: true
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('createSocio error:', error);
    return res.status(500).json({ message: 'No se pudo crear el socio.' });
  }
}

async function listMembresias(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM membresias ORDER BY precio ASC');
    return res.json(result.recordset);
  } catch (error) {
    console.error('listMembresias error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar las membresías.' });
  }
}

async function createMembresia(req, res) {
  const { tipo, precio, duracion_dias } = req.body || {};

  if (!tipo || !precio || !duracion_dias) {
    return res.status(400).json({ message: 'Tipo, precio y duración son obligatorios.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('tipo', sql.VarChar(50), tipo)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('duracion_dias', sql.Int, duracion_dias)
      .query(`
        INSERT INTO membresias (tipo, precio, duracion_dias)
        VALUES (@tipo, @precio, @duracion_dias)
      `);

    return res.status(201).json({ message: 'Membresía creada correctamente.' });
  } catch (error) {
    console.error('createMembresia error:', error);
    return res.status(500).json({ message: 'No se pudo crear la membresía.' });
  }
}

async function updateMembresia(req, res) {
  const { id } = req.params;
  const { tipo, precio, duracion_dias } = req.body || {};

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, Number(id))
      .input('tipo', sql.VarChar(50), tipo)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('duracion_dias', sql.Int, duracion_dias)
      .query(`
        UPDATE membresias
        SET tipo = @tipo, precio = @precio, duracion_dias = @duracion_dias
        WHERE id = @id
      `);

    return res.json({ message: 'Membresía actualizada correctamente.' });
  } catch (error) {
    console.error('updateMembresia error:', error);
    return res.status(500).json({ message: 'No se pudo actualizar la membresía.' });
  }
}

async function deleteMembresia(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .query('DELETE FROM membresias WHERE id = @id');

    return res.json({ message: 'Membresía eliminada.' });
  } catch (error) {
    console.error('deleteMembresia error:', error);
    return res.status(500).json({ message: 'No se pudo eliminar la membresía.' });
  }
}

async function assignMembership(req, res) {
  const { id_socio, id_membresia, validado_por_recepcionista = false } = req.body || {};

  if (!id_socio || !id_membresia) {
    return res.status(400).json({ message: 'id_socio e id_membresia son obligatorios.' });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // Fetch duration (fallback to 30 days if missing or invalid)
    const memRes = await new sql.Request(transaction)
      .input('id_membresia', sql.Int, Number(id_membresia))
      .query('SELECT duracion_dias FROM membresias WHERE id = @id_membresia');

    let duration = Number(memRes.recordset[0]?.duracion_dias || 30);
    if (!Number.isInteger(duration) || duration <= 0) duration = 30; // treat month as 30 days when needed

    // Check for existing active membership
    const existingRes = await new sql.Request(transaction)
      .input('id_socio', sql.Int, Number(id_socio))
      .query("SELECT id, fecha_inicio, fecha_fin, id_membresia FROM membresias_socio WHERE id_socio = @id_socio AND estado = 'activa'");

    if (existingRes.recordset[0]) {
      // Extend existing active membership instead of inserting a duplicate
      const existing = existingRes.recordset[0];

      await new sql.Request(transaction)
        .input('id', sql.Int, Number(existing.id))
        .input('duration', sql.Int, duration)
        .input('id_membresia', sql.Int, Number(id_membresia))
        .input('validado', sql.Bit, Boolean(validado_por_recepcionista))
        .query(`
          UPDATE membresias_socio
          SET fecha_fin = DATEADD(day, @duration, ISNULL(fecha_fin, GETDATE())),
              id_membresia = @id_membresia,
              validado_por_recepcionista = @validado
          WHERE id = @id
        `);

      await transaction.commit();
      return res.json({ message: 'Membresía extendida correctamente.' });
    }

    // No active membership, create a new one
    const insertRes = await new sql.Request(transaction)
      .input('id_socio', sql.Int, Number(id_socio))
      .input('id_membresia', sql.Int, Number(id_membresia))
      .input('duration', sql.Int, duration)
      .input('validado', sql.Bit, Boolean(validado_por_recepcionista))
      .query(`
        INSERT INTO membresias_socio (id_socio, id_membresia, fecha_inicio, fecha_fin, estado, validado_por_recepcionista)
        OUTPUT INSERTED.id
        VALUES (@id_socio, @id_membresia, GETDATE(), DATEADD(day, @duration, GETDATE()), 'activa', @validado)
      `);

    await transaction.commit();
    return res.status(201).json({ message: 'Membresía asignada.', id: insertRes.recordset[0]?.id });
  } catch (error) {
    await transaction.rollback();
    console.error('assignMembership error:', error);
    return res.status(500).json({ message: 'No se pudo asignar la membresía.' });
  }
}

async function listProductos(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM productos ORDER BY categoria, nombre');
    return res.json(result.recordset);
  } catch (error) {
    console.error('listProductos error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los productos.' });
  }
}

async function createProducto(req, res) {
  const { nombre, categoria, precio, stock } = req.body || {};

  if (!nombre || !categoria || !precio || stock === undefined) {
    return res.status(400).json({ message: 'Nombre, categoría, precio y stock son obligatorios.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('nombre', sql.VarChar(255), nombre)
      .input('categoria', sql.VarChar(50), categoria)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('stock', sql.Int, stock)
      .query(`
        INSERT INTO productos (nombre, categoria, precio, stock)
        VALUES (@nombre, @categoria, @precio, @stock)
      `);

    return res.status(201).json({ message: 'Producto creado correctamente.' });
  } catch (error) {
    console.error('createProducto error:', error);
    return res.status(500).json({ message: 'No se pudo crear el producto.' });
  }
}

async function updateProducto(req, res) {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body || {};

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, Number(id))
      .input('nombre', sql.VarChar(255), nombre)
      .input('categoria', sql.VarChar(50), categoria)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('stock', sql.Int, stock)
      .query(`
        UPDATE productos
        SET nombre = @nombre, categoria = @categoria, precio = @precio, stock = @stock
        WHERE id = @id
      `);

    return res.json({ message: 'Producto actualizado correctamente.' });
  } catch (error) {
    console.error('updateProducto error:', error);
    return res.status(500).json({ message: 'No se pudo actualizar el producto.' });
  }
}

async function deleteProducto(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .query('DELETE FROM productos WHERE id = @id');

    return res.json({ message: 'Producto eliminado.' });
  } catch (error) {
    console.error('deleteProducto error:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el producto.' });
  }
}

async function listVentas(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT v.id, v.id_usuario_vendedor, v.fecha, v.total,
             u.nombre AS vendedor
      FROM ventas v
      LEFT JOIN usuarios u ON u.id = v.id_usuario_vendedor
      ORDER BY v.fecha DESC
    `);
    return res.json(result.recordset);
  } catch (error) {
    console.error('listVentas error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar las ventas.' });
  }
}

async function createVenta(req, res) {
  try {
    const { id_usuario_vendedor, items = [] } = req.body || {};
    const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe incluir al menos un producto en la venta.' });
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const ventaRes = await new sql.Request(transaction)
        .input('id_usuario_vendedor', id_usuario_vendedor ? sql.Int : sql.Null, id_usuario_vendedor || null)
        .input('total', sql.Decimal(10, 2), total)
        .query(`
          INSERT INTO ventas (id_usuario_vendedor, fecha, total)
          OUTPUT INSERTED.id
          VALUES (@id_usuario_vendedor, GETDATE(), @total)
        `);

      const ventaId = ventaRes.recordset[0].id;

      for (const item of items) {
        const subtotal = Number(item.precio || 0) * Number(item.cantidad || 0);

        await new sql.Request(transaction)
          .input('id_venta', sql.Int, ventaId)
          .input('id_producto', sql.Int, Number(item.id))
          .input('cantidad', sql.Int, Number(item.cantidad))
          .input('subtotal', sql.Decimal(10, 2), subtotal)
          .query(`
            INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, subtotal)
            VALUES (@id_venta, @id_producto, @cantidad, @subtotal)
          `);

        await new sql.Request(transaction)
          .input('id_producto', sql.Int, Number(item.id))
          .input('cantidad', sql.Int, Number(item.cantidad))
          .query(`
            UPDATE productos
            SET stock = stock - @cantidad
            WHERE id = @id_producto
          `);
      }

      await transaction.commit();
      return res.status(201).json({ message: 'Venta registrada correctamente.' });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('createVenta error:', error);
    return res.status(500).json({ message: 'No se pudo registrar la venta.' });
  }
}

async function listReservas(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT r.id, r.id_socio, r.id_entrenador, r.fecha, r.hora, r.estado,
             s.nombre AS nombre_socio,
             u.nombre AS nombre_entrenador
      FROM reservas r
      LEFT JOIN socios soc ON soc.id = r.id_socio
      LEFT JOIN usuarios s ON s.id = soc.id_usuario
      LEFT JOIN entrenadores e ON e.id = r.id_entrenador
      LEFT JOIN usuarios u ON u.id = e.id_usuario
      ORDER BY r.fecha, r.hora
    `);
    return res.json(result.recordset);
  } catch (error) {
    console.error('listReservas error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar las reservas.' });
  }
}

async function createReserva(req, res) {
  const { id_socio, id_entrenador, fecha, hora, estado = 'pendiente' } = req.body || {};

  if (!id_socio || !id_entrenador || !fecha || !hora) {
    return res.status(400).json({ message: 'Datos incompletos para la reserva.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('id_socio', sql.Int, Number(id_socio))
      .input('id_entrenador', sql.Int, Number(id_entrenador))
      .input('fecha', sql.Date, fecha)
      .input('hora', sql.VarChar(10), hora)
      .input('estado', sql.VarChar(20), estado)
      .query(`
        INSERT INTO reservas (id_socio, id_entrenador, fecha, hora, estado)
        VALUES (@id_socio, @id_entrenador, @fecha, @hora, @estado)
      `);

    return res.status(201).json({ message: 'Reserva creada correctamente.' });
  } catch (error) {
    console.error('createReserva error:', error);
    return res.status(500).json({ message: 'No se pudo crear la reserva.' });
  }
}

async function updateReserva(req, res) {
  const { id } = req.params;
  const { estado } = req.body || {};

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, Number(id))
      .input('estado', sql.VarChar(20), estado)
      .query(`
        UPDATE reservas SET estado = @estado WHERE id = @id
      `);

    return res.json({ message: 'Reserva actualizada.' });
  } catch (error) {
    console.error('updateReserva error:', error);
    return res.status(500).json({ message: 'No se pudo actualizar la reserva.' });
  }
}

async function listVisitantes(_req, res) {
  try {
    const pool = await getPool();
    const [visitantes, asistencias] = await Promise.all([
      pool.request().query('SELECT * FROM visitantes_dia ORDER BY fecha_registro DESC'),
      pool.request().query('SELECT * FROM asistencias_dia ORDER BY fecha DESC')
    ]);

    return res.json({ visitantes: visitantes.recordset, asistencias: asistencias.recordset });
  } catch (error) {
    console.error('listVisitantes error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los visitantes.' });
  }
}

async function registerVisitor(req, res) {
  const { nombre, documento, tipo_visitante, nombre_acudiente, tipo_pase, precio_pagado } = req.body || {};

  if (!nombre || !documento || !tipo_visitante) {
    return res.status(400).json({ message: 'Nombre, documento y tipo de visitante son obligatorios.' });
  }

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const visitorRes = await new sql.Request(transaction)
        .input('nombre', sql.VarChar(255), nombre)
        .input('documento', sql.VarChar(50), documento)
        .input('tipo_visitante', sql.VarChar(20), tipo_visitante)
        .input('nombre_acudiente', sql.VarChar(255), nombre_acudiente || null)
        .query(`
          INSERT INTO visitantes_dia (nombre, documento, tipo_visitante, nombre_acudiente, fecha_registro)
          OUTPUT INSERTED.id
          VALUES (@nombre, @documento, @tipo_visitante, @nombre_acudiente, GETDATE())
        `);

      const visitanteId = visitorRes.recordset[0].id;

      await new sql.Request(transaction)
        .input('id_visitante', sql.Int, visitanteId)
        .input('fecha', sql.Date, new Date().toISOString().slice(0, 10))
        .input('tipo_pase', sql.VarChar(30), tipo_pase || 'normal')
        .input('precio_pagado', sql.Decimal(10, 2), precio_pagado || 0)
        .query(`
          INSERT INTO asistencias_dia (id_visitante, fecha, tipo_pase, precio_pagado)
          VALUES (@id_visitante, @fecha, @tipo_pase, @precio_pagado)
        `);

      await transaction.commit();
      return res.status(201).json({ message: 'Visitante registrado correctamente.' });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('registerVisitor error:', error);
    return res.status(500).json({ message: 'No se pudo registrar el visitante.' });
  }
}

async function getReportes(_req, res) {
  try {
    const pool = await getPool();
    const [ventasMes, ventasMesAnterior, sociosActivos, visitantes, membresiasPorVencer] = await Promise.all([
      pool.request().query(`
        SELECT ISNULL(SUM(total), 0) AS total FROM ventas
        WHERE MONTH(fecha) = MONTH(GETDATE()) AND YEAR(fecha) = YEAR(GETDATE())
      `),
      pool.request().query(`
        SELECT ISNULL(SUM(total), 0) AS total FROM ventas
        WHERE MONTH(fecha) = MONTH(DATEADD(month, -1, GETDATE())) AND YEAR(fecha) = YEAR(DATEADD(month, -1, GETDATE()))
      `),
      pool.request().query(`
        SELECT COUNT(*) AS total FROM membresias_socio WHERE estado = 'activa'
      `),
      pool.request().query(`
        SELECT COUNT(*) AS total FROM asistencias_dia WHERE CAST(fecha AS date) = CAST(GETDATE() AS date)
      `),
      pool.request().query(`
        SELECT COUNT(*) AS total FROM membresias_socio WHERE estado = 'activa' AND fecha_fin BETWEEN GETDATE() AND DATEADD(day, 7, GETDATE())
      `)
    ]);

    const salesCurrent = Number(ventasMes.recordset[0]?.total || 0);
    const salesPrev = Number(ventasMesAnterior.recordset[0]?.total || 0);
    const variation = salesPrev === 0 ? 0 : ((salesCurrent - salesPrev) / salesPrev) * 100;

    return res.json({
      metrics: {
        ventasMes: salesCurrent,
        sociosActivos: Number(sociosActivos.recordset[0]?.total || 0),
        membresiasPorVencer: Number(membresiasPorVencer.recordset[0]?.total || 0),
        visitantesDia: Number(visitantes.recordset[0]?.total || 0)
      },
      variation: {
        ventasMes: Number(variation.toFixed(1))
      }
    });
  } catch (error) {
    console.error('getReportes error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los reportes.' });
  }
}

async function listRecepcionistas(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'recepcionista' ORDER BY nombre ASC
    `);
    return res.json(result.recordset);
  } catch (error) {
    console.error('listRecepcionistas error:', error);
    return res.status(500).json({ message: 'No se pudieron cargar los recepcionistas.' });
  }
}

module.exports = {
  listUsuarios,
  updateUsuario,
  createUsuario,
  listSocios,
  getSocioById,
  createSocio,
  listMembresias,
  createMembresia,
  updateMembresia,
  deleteMembresia,
  assignMembership,
  listProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  listVentas,
  createVenta,
  listReservas,
  createReserva,
  updateReserva,
  listVisitantes,
  registerVisitor,
  getReportes,
  listRecepcionistas
};
