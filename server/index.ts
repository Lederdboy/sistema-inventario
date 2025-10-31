import express from "express";
import cors from "cors";

// Solo cargar dotenv en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

// 🔍 DEBUG: Ver TODAS las variables de entorno disponibles
console.log('═══════════════════════════════════════════════');
console.log('🔍 TODAS LAS VARIABLES DE ENTORNO:');
console.log('═══════════════════════════════════════════════');
Object.keys(process.env).sort().forEach(key => {
  const value = process.env[key];
  if (key.includes('MYSQL') || key.includes('DB') || key.includes('DATABASE')) {
    console.log(`${key}:`, value);
  }
});
console.log('═══════════════════════════════════════════════');

const app = express();

// ============================================
// CORS - DEBE IR PRIMERO
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4000',
  'https://sistema-inventario-963852.web.app',
  'https://sistema-inventario-963852.firebaseapp.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (Postman, apps móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS - Origin no permitido:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// MIDDLEWARES
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// IMPORTAR RUTAS
// ============================================
import requirementRoutes from "./routes/requirements.routes.js";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import supplierRoutes from "./routes/suppliers.routes.js";
import stockMovementRoutes from "./routes/stock-movements.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// ============================================
// RUTAS API
// ============================================
app.use("/api/requirements", requirementRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    database: process.env.DB_NAME,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({ 
    message: "Sistema de Inventario API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      categories: "/api/categories",
      suppliers: "/api/suppliers",
      requirements: "/api/requirements",
      stockMovements: "/api/stock-movements",
      dashboard: "/api/dashboard"
    }
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    path: req.path 
  });
});

// Error handler general
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

// ✅ Convertir PORT a número explícitamente
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Base de datos: ${process.env.DB_NAME || 'No configurada'}`);
  console.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');
});

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection en:', promise, 'razón:', reason);
  // No cerrar el servidor en producción por un error no manejado
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Cerrar el servidor de forma segura
  process.exit(1);
});