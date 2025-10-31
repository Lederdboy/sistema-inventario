import mysql from "mysql2/promise";

console.log('🔧 Configurando conexión MySQL...');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);
console.log('   User:', process.env.DB_USER);
console.log('   Database:', process.env.DB_NAME);
console.log('   Password:', process.env.DB_PASSWORD ? '✅ Configurada' : '❌ No configurada');

export const pool = mysql.createPool({
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

// Test de conexión
pool.getConnection()
  .then(connection => {
    console.log('═══════════════════════════════════════');
    console.log('✅ MySQL conectado exitosamente');
    console.log('   Base de datos:', process.env.DB_NAME);
    console.log('   Host:', process.env.DB_HOST);
    console.log('═══════════════════════════════════════');
    connection.release();
  })
  .catch(err => {
    console.error('═══════════════════════════════════════');
    console.error('❌ Error de conexión a MySQL');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('═══════════════════════════════════════');
  });