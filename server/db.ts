import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// 🔧 LOGS DE DEBUG - Ver qué variables llegan desde Railway
console.log('═══════════════════════════════════════');
console.log('🔧 DEBUG: Variables de entorno MySQL');
console.log('═══════════════════════════════════════');
console.log('DB_HOST:', process.env.DB_HOST || '❌ NO DEFINIDA');
console.log('DB_PORT:', process.env.DB_PORT || '❌ NO DEFINIDA');
console.log('DB_USER:', process.env.DB_USER || '❌ NO DEFINIDA');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ ***' : '❌ NO DEFINIDA');
console.log('DB_NAME:', process.env.DB_NAME || '❌ NO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('═══════════════════════════════════════');

// Intentar usar MYSQL_URL si existe (Railway a veces usa esto)
if (process.env.MYSQL_URL) {
  console.log('✅ MYSQL_URL encontrada, intentando parsear...');
  console.log('MYSQL_URL:', process.env.MYSQL_URL.replace(/:[^:@]*@/, ':***@')); // Ocultar password
}

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

// Test de conexión con más detalles
pool.getConnection()
  .then(connection => {
    console.log('═══════════════════════════════════════');
    console.log('✅ MySQL conectado exitosamente');
    console.log('   Base de datos:', process.env.DB_NAME);
    console.log('   Host:', process.env.DB_HOST);
    console.log('   Puerto:', process.env.DB_PORT);
    console.log('═══════════════════════════════════════');
    connection.release();
  })
  .catch(err => {
    console.error('═══════════════════════════════════════');
    console.error('❌ Error de conexión a MySQL');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('   Host intentado:', process.env.DB_HOST || 'localhost');
    console.error('   Puerto intentado:', process.env.DB_PORT || '3307');
    console.error('═══════════════════════════════════════');
  });