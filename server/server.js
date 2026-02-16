import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import bondiRoutes from './routes/bondiRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import authRoutes from './routes/authRoutes.js';
import proxyRoutes from './routes/proxyRoutes.js';
import reportesRoutes from './routes/reportesRoutes.js';
import estadoColectivoRoutes from './routes/estadoColectivoRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
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
app.use(express.json());
app.use(cookieParser());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Firebase Connection (Initialized in firebase.js, we just log it here or require it)
import { isMock } from './firebase.js';
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
app.use('/api/auth', authRoutes);
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
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
