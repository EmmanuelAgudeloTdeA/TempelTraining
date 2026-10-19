const sql = require('mssql');

const baseConfig = {
  database: process.env.DB_DATABASE || 'GimnasioDB',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: String(process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate:
      String(process.env.DB_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

function buildServerCandidates() {
  const rawServer = (process.env.DB_SERVER || 'localhost').trim();
  const candidates = [rawServer];

  if (rawServer.includes('\\')) {
    const [hostPart] = rawServer.split('\\');
    if (hostPart) candidates.push(hostPart);
  }

  ['localhost', '127.0.0.1', 'localhost\\SQLEXPRESS', '127.0.0.1\\SQLEXPRESS'].forEach((candidate) => {
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
  });

  return [...new Set(candidates.filter(Boolean))];
}

const config = { ...baseConfig, server: buildServerCandidates()[0] };

let pool;

async function connectToDatabase() {
  if (!pool) {
    const candidates = buildServerCandidates();
    let lastError = null;

    for (const server of candidates) {
      try {
        pool = await sql.connect({ ...baseConfig, server });
        return pool;
      } catch (error) {
        lastError = error;
        console.warn(`No se pudo conectar a SQL Server en '${server}': ${error.message}`);
      }
    }

    throw lastError || new Error('No se pudo conectar a SQL Server.');
  }

  return pool;
}

async function getPool() {
  if (!pool) {
    await connectToDatabase();
  }

  return pool;
}

module.exports = { sql, config, connectToDatabase, getPool };
