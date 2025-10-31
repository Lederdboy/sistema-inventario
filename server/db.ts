import mysql from "mysql2/promise";

console.log('🔧 Configurando conexión MySQL...');

let pool: mysql.Pool;

// Railway proporciona las variables con estos nombres exactos cuando usas ${{ MySQL.VARIABLE }}
const MYSQL_URL = process.env.MYSQL_URL;
const MYSQLHOST = process.env.MYSQLHOST;
const MYSQLPORT = process.env.MYSQLPORT;
const MYSQLUSER = process.env.MYSQLUSER;
const MYSQLPASSWORD = process.env.MYSQLPASSWORD;
const MYSQLDATABASE = process.env.MYSQLDATABASE;

console.log('🔍 Variables detectadas:');
console.log('   MYSQL_URL:', MYSQL_URL ? '✅ Existe' : '❌ No existe');
console.log('   MYSQLHOST:', MYSQLHOST || 'No configurado');
console.log('   MYSQLPORT:', MYSQLPORT || 'No configurado');
console.log('   MYSQLUSER:', MYSQLUSER || 'No configurado');
console.log('   MYSQLPASSWORD:', MYSQLPASSWORD ? '✅ Configurada' : '❌ No configurada');
console.log('   MYSQLDATABASE:', MYSQLDATABASE || 'No configurado');

// OPCIÓN 1: Usar MYSQL_URL completa (Railway la proporciona automáticamente)
if (MYSQL_URL) {
  try {
    console.log('✅ Usando MYSQL_URL');
    const url = new URL(MYSQL_URL);
    
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password), // Decodificar por si tiene caracteres especiales
      database: url.pathname.substring(1), // Remover el "/" inicial
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
    
    console.log('   📋 Configuración parseada:');
    console.log('      Host:', config.host);
    console.log('      Port:', config.port);
    console.log('      User:', config.user);
    console.log('      Database:', config.database);
    console.log('      Password:', config.password ? '✅ Configurada' : '❌ Vacía');
    
    pool = mysql.createPool(config);
  } catch (error) {
    console.error('❌ Error parseando MYSQL_URL:', error);
    throw error; // Detener aquí si falla
  }
} 
// OPCIÓN 2: Usar variables individuales (cuando Railway las proporciona por separado)
else if (MYSQLHOST && MYSQLUSER && MYSQLPASSWORD && MYSQLDATABASE) {
  console.log('📋 Usando variables individuales de Railway');
  
  const config = {
    host: MYSQLHOST,
    port: parseInt(MYSQLPORT || '3306'),
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
  
  console.log('   📋 Configuración:');
  console.log('      Host:', config.host);
  console.log('      Port:', config.port);
  console.log('      User:', config.user);
  console.log('      Database:', config.database);
  
  pool = mysql.createPool(config);
}
// OPCIÓN 3: Fallback para desarrollo local
else {
  console.log('⚠️  Usando configuración de desarrollo local');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "inventario",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export { pool };

// Test de conexión inmediato
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Verificar qué base de datos estamos usando
    const [rows] = await connection.query('SELECT DATABASE() as db, USER() as user');
    const dbInfo = rows as any[];
    
    console.log('═══════════════════════════════════════');
    console.log('✅ MySQL conectado exitosamente');
    console.log('   📊 Base de datos activa:', dbInfo[0].db);
    console.log('   👤 Usuario conectado:', dbInfo[0].user);
    console.log('═══════════════════════════════════════');
    
    connection.release();
    return true;
  } catch (err: any) {
    console.error('═══════════════════════════════════════');
    console.error('❌ Error de conexión a MySQL');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('   Estado SQL:', err.sqlState);
    console.error('   ');
    console.error('   🔍 Diagnóstico:');
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   ⚠️  Error de autenticación - Verifica:');
      console.error('      1. Usuario correcto');
      console.error('      2. Contraseña correcta');
      console.error('      3. Host correcto');
      console.error('   ');
      console.error('   💡 Solución: Revisa las variables en Railway:');
      console.error('      - Asegúrate de usar ${{MySQL.MYSQL_URL}}');
      console.error('      - O configura todas las variables individuales');
    } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      console.error('   ⚠️  No se puede conectar al host');
      console.error('      - Verifica que el servicio MySQL esté activo');
      console.error('      - Confirma que el host es correcto');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   ⚠️  Base de datos no existe');
      console.error('      - La base de datos especificada no existe');
    }
    
    console.error('═══════════════════════════════════════');
    
    // En producción, lanzar el error para que la app no arranque mal configurada
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    
    return false;
  }
};

// Ejecutar test de conexión
testConnection();