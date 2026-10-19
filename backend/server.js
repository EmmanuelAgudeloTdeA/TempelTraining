require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const gymRoutes = require('./src/routes/gymRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Tempel Training API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api', gymRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: err.message || 'unknown-error'
  });
});

(async () => {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });

  try {
    await Promise.race([
      connectToDatabase(),
      new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con SQL Server.')), 5000);
      })
    ]);
    console.log('Conexión a SQL Server establecida correctamente.');
  } catch (error) {
    console.warn('No se pudo conectar a SQL Server. Verifica la configuración de .env.');
    console.warn(error.message || error);
  }
})();
