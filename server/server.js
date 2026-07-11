import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import bondiRoutes from './routes/bondiRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proxyRoutes from './routes/proxyRoutes.js';
import reportesRoutes from './routes/reportesRoutes.js';
import estadoColectivoRoutes from './routes/estadoColectivoRoutes.js';
import { sessionMiddleware } from './middleware/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8001;
const isProduction = process.env.NODE_ENV === 'production';

// Render (y cualquier PaaS) corre detrás de un proxy: sin esto express-rate-limit
// vería la IP del proxy para todos los clientes.
app.set('trust proxy', 1);

// Security headers. La CSP solo aplica en producción (en dev Vite maneja el HTML).
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.basemaps.cartocdn.com', 'https://tile.openstreetmap.org', 'https://*.tile.openstreetmap.org'],
      connectSrc: ["'self'"],
      workerSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  } : false
}));

// SECURITY: Never use CORS_ORIGINS=* in production.
// Set CORS_ORIGINS as a comma-separated list of allowed origins in your .env
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8001'
  ];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Sesión anónima firmada: adjunta req.userId a todo /api
app.use('/api', sessionMiddleware);

// Rate limiting.
// Render corre detrás de Cloudflare: req.ip con trust proxy termina siendo el
// edge de CF (rota por request y rompe el conteo). CF-Connecting-IP trae la IP
// real del cliente y Cloudflare la sobreescribe siempre (no es spoofeable).
const clientIpKey = (req) => ipKeyGenerator(req.headers['cf-connecting-ip'] || req.ip);

const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey
});
const strictLimiter = (limit) => rateLimit({
  windowMs: 60 * 1000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { error: 'Demasiadas solicitudes, esperá un momento.' }
});

app.use('/api', globalLimiter);
app.use('/api/bondi/reportar', strictLimiter(5));
// Anti-spoofing: el cliente legítimo pinguea cada 10s (6/min); margen ×2.
app.use('/api/bondi/ping', strictLimiter(12));
app.use('/api/estado/registrar-usuario', strictLimiter(6));
app.use('/api/reportes/crear', strictLimiter(4));
app.use('/api/reportes/confirmar', strictLimiter(20));
app.use('/api/reportes/validar', strictLimiter(20));
app.use('/api/usuario', strictLimiter(30));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Firebase Connection (Initialized in firebase.js, we just log it here or require it)
import { db, isMock } from './firebase.js';
if (isMock) {
  console.log('⚠️  Running in Firebase MOCK MODE');
} else {
  console.log('🔥 Firebase initialized');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend BONDIFY funcionando correctamente (Firebase)',
    mode: isMock ? 'MOCK' : 'REAL',
    features: {
      colectivos: true,
      usuarios: true,
      geminiAI: true
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/bondi', bondiRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/estado', estadoColectivoRoutes);
app.use('/api/proxy', proxyRoutes);

// Catch-all handler for any request that doesn't match the above
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(isProduction ? {} : { message: err.message })
  });
});

// Janitor de datos (privacidad): borra colectivos viejos y reportes expirados.
// Respalda la promesa de la política de privacidad de eliminar posiciones.
const JANITOR_INTERVAL_MS = 15 * 60 * 1000;
if (!isMock) {
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000);
      const staleBuses = await db.collection('colectivos')
        .where('ultimaActualizacion', '<', cutoff)
        .limit(100)
        .get();
      for (const doc of staleBuses.docs) {
        await doc.ref.delete();
      }

      const nowIso = new Date().toISOString();
      const expiredReports = await db.collection('reportes_comunitarios')
        .where('expiresAt', '<', nowIso)
        .limit(100)
        .get();
      for (const doc of expiredReports.docs) {
        await doc.ref.delete();
      }

      if (staleBuses.size > 0 || expiredReports.size > 0) {
        console.log(`🧹 Janitor: ${staleBuses.size} colectivos viejos y ${expiredReports.size} reportes expirados eliminados`);
      }
    } catch (e) {
      console.error('Janitor error:', e.message);
    }
  }, JANITOR_INTERVAL_MS);
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
