// Test simple para ver si las variables llegan
console.log('═══════════════════════════════════════════════');
console.log('🔍 TEST DE VARIABLES - INICIO');
console.log('═══════════════════════════════════════════════');
console.log('process.env.DB_HOST =', process.env.DB_HOST);
console.log('process.env.DB_PORT =', process.env.DB_PORT);
console.log('process.env.DB_USER =', process.env.DB_USER);
console.log('process.env.DB_PASSWORD =', process.env.DB_PASSWORD ? 'DEFINED' : 'UNDEFINED');
console.log('process.env.DB_NAME =', process.env.DB_NAME);
console.log('process.env.NODE_ENV =', process.env.NODE_ENV);
console.log('process.env.PORT =', process.env.PORT);
console.log('═══════════════════════════════════════════════');
console.log('Total de variables de entorno:', Object.keys(process.env).length);
console.log('Variables con DB:', Object.keys(process.env).filter(k => k.includes('DB')));
console.log('Variables con MYSQL:', Object.keys(process.env).filter(k => k.includes('MYSQL')));
console.log('═══════════════════════════════════════════════');

// Servidor mínimo
import express from 'express';
const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Test variables',
    env: {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      NODE_ENV: process.env.NODE_ENV
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor test en puerto ${PORT}`);
});