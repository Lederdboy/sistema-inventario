import mysql from "mysql2/promise";

console.log('🔧 Configurando conexión MySQL...');

let pool;

// Intentar usar MYSQL_URL primero (más confiable)
if (process.env.MYSQL_URL) {
  try {
    console.log('✅ Usando MYSQL_URL');
    const url = new URL(process.env.MYSQL_URL);
    
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port || '3306');
    console.log('   User:', url.username);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Password: ✅ Configurada');
    
    pool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: "+00:00"
    });
  } catch (error) {
    console.error('⚠️  Error parseando MYSQL_URL:', error);
    console.log('⚠️  Usando variables individuales como fallback...');
    pool = null;
  }
}

// Si MYSQL_URL no existe o falló, usar variables individuales
if (!pool) {
  console.log('📋 Usando variables individuales');
  console.log('   Host:', process.env.DB_HOST);
  console.log('   Port:', process.env.DB_PORT);
  console.log('   User:', process.env.DB_USER);
  console.log('   Database:', process.env.DB_NAME);
  console.log('   Password:', process.env.DB_PASSWORD ? '✅ Configurada' : '❌ No configurada');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307"), 
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "Inventario",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00"
  });
}

export { pool };

// Test de conexión
pool.getConnection()
  .then(connection => {
    console.log('═══════════════════════════════════════');
    console.log('✅ MySQL conectado exitosamente');
    console.log('═══════════════════════════════════════');
    connection.release();
  })
  .catch(err => {
    console.error('═══════════════════════════════════════');
    console.error('❌ Error de conexión a MySQL');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('   Host usado:', process.env.DB_HOST || 'desde MYSQL_URL');
    console.error('═══════════════════════════════════════');
  });