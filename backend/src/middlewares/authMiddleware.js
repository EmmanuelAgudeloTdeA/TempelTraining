const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header) {
    return res.status(401).json({ message: 'Token de autenticación requerido.' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tempel-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};
