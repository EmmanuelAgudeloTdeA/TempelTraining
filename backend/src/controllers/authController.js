const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { getPool } = require('../config/db');

const DEFAULT_SOCIO_PASSWORD = 'Tempel2026!';

const normalizeEmail = (value) => (value || '').trim().toLowerCase();

const passwordMatches = async (candidatePassword, storedPassword) => {
  if (!candidatePassword || !storedPassword) return false;

  const normalizedPassword = String(candidatePassword).trim();
  const normalizedStored = String(storedPassword).trim();

  if (normalizedStored === normalizedPassword) {
    return true;
  }

  if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
    return bcrypt.compare(normalizedPassword, storedPassword);
  }

  try {
    return await bcrypt.compare(normalizedPassword, normalizedStored);
  } catch (_error) {
    return false;
  }
};

const isTemporaryPassword = async (hash) => {
  if (!hash) return false;

  try {
    return await bcrypt.compare(DEFAULT_SOCIO_PASSWORD, hash);
  } catch (_error) {
    return false;
  }
};

const getSafeUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
  fecha_registro: user.fecha_registro
});

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  try {
    const pool = await getPool();
    const normalizedEmail = normalizeEmail(email);
    const result = await pool.request()
      .input('email', sql.VarChar(255), normalizedEmail)
      .query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER(@email)');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const validPassword = await passwordMatches(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const mustChangePassword = await isTemporaryPassword(user.password);

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre, email: user.email, mustChangePassword },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: getSafeUser(user),
      mustChangePassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
}

async function getBootstrapStatus(_req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP 1 id
      FROM usuarios
      WHERE LOWER(rol) = 'administrador'
    `);

    return res.json({ hasAdmin: result.recordset.length > 0 });
  } catch (error) {
    console.error('getBootstrapStatus error:', error);
    return res.status(500).json({ message: 'No se pudo verificar el estado del administrador.' });
  }
}

async function bootstrapAdmin(req, res) {
  const { nombre, email, password } = req.body || {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
  }

  const trimmedName = nombre.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName || !trimmedEmail) {
    return res.status(400).json({ message: 'Nombre y email son obligatorios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ message: 'El email no tiene un formato válido.' });
  }

  try {
    const pool = await getPool();

    const adminCheck = await pool.request().query(`
      SELECT TOP 1 id
      FROM usuarios
      WHERE LOWER(rol) = 'administrador'
    `);

    if (adminCheck.recordset.length > 0) {
      return res.status(403).json({ message: 'Ya existe un administrador en el sistema. Inicia sesión para crear más usuarios.' });
    }

    const existingUser = await pool.request()
      .input('email', sql.VarChar(255), trimmedEmail)
      .query('SELECT TOP 1 id FROM usuarios WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('nombre', sql.VarChar(255), trimmedName)
      .input('email', sql.VarChar(255), trimmedEmail)
      .input('password', sql.VarChar(255), hashedPassword)
      .query(`
        INSERT INTO usuarios (nombre, email, password, rol, fecha_registro)
        OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol, INSERTED.fecha_registro
        VALUES (@nombre, @email, @password, 'administrador', GETDATE())
      `);

    const createdUser = result.recordset[0];

    return res.status(201).json({
      message: 'Administrador principal creado correctamente.',
      user: getSafeUser(createdUser)
    });
  } catch (error) {
    console.error('bootstrapAdmin error:', error);
    return res.status(500).json({ message: 'No se pudo crear el administrador principal.' });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Debe proporcionar la contraseña actual y la nueva.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT * FROM usuarios WHERE id = @id');

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const validCurrent = await bcrypt.compare(currentPassword, user.password);
    if (!validCurrent) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
    }

    const updatedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('password', sql.VarChar(255), updatedPassword)
      .query('UPDATE usuarios SET password = @password WHERE id = @id');

    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ message: 'No se pudo actualizar la contraseña.' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, nombre, email, rol, fecha_registro FROM usuarios WHERE id = @id');

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json({ user: getSafeUser(user) });
  } catch (error) {
    console.error('Load me error:', error);
    return res.status(500).json({ message: 'No se pudo cargar el usuario.' });
  }
}

async function resetAdminPassword(req, res) {
  const { email, newPassword } = req.body || {};

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email y nueva contraseña son obligatorios.' });
  }

  // Safety checks: allow when running in non-production or when explicit env flag is set
  const allowReset = String(process.env.ALLOW_ADMIN_RESET || '').toLowerCase() === 'true' || (process.env.NODE_ENV || 'development') !== 'production';

  // Also allow if request is from localhost
  const remote = (req.ip || req.connection?.remoteAddress || '').replace('::ffff:', '');
  const fromLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote);

  if (!allowReset && !fromLocal) {
    return res.status(403).json({ message: 'Reset de contraseña de administrador deshabilitado en este entorno.' });
  }

  try {
    const pool = await getPool();
    const normalizedEmail = normalizeEmail(email);

    const userRes = await pool.request()
      .input('email', sql.VarChar(255), normalizedEmail)
      .query("SELECT TOP 1 id, rol FROM usuarios WHERE LOWER(email) = LOWER(@email)");

    const user = userRes.recordset[0];
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    if ((user.rol || '').toLowerCase() !== 'administrador') return res.status(403).json({ message: 'El usuario no es administrador.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('id', sql.Int, Number(user.id))
      .input('password', sql.VarChar(255), hashed)
      .query('UPDATE usuarios SET password = @password WHERE id = @id');

    return res.json({ message: 'Contraseña de administrador restablecida correctamente.' });
  } catch (error) {
    console.error('resetAdminPassword error:', error);
    return res.status(500).json({ message: 'No se pudo restablecer la contraseña.' });
  }
}

module.exports = { login, getBootstrapStatus, bootstrapAdmin, resetAdminPassword, changePassword, getCurrentUser };
