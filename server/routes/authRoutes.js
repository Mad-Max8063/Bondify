import express from 'express';
import axios from 'axios';
import userService from '../services/userService.js';
import { db } from '../firebase.js';

const router = express.Router();

// Colección de sesiones
const SESSIONS_COLLECTION = 'user_sessions';

/**
 * 🔐 RUTA 1: Procesar session_id de Emergent Auth
 * Frontend envía session_id después de Google OAuth
 */
router.post('/session', async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id requerido' });
  }

  try {
    // Obtener datos del usuario desde Emergent Auth
    const response = await axios.get(
      'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
      {
        headers: { 'X-Session-ID': session_id }
      }
    );

    const { id, email, name, picture, session_token } = response.data;

    // Buscar o crear usuario
    let usuario = await userService.getUserByEmail(email);

    if (!usuario) {
      // Generar ID único
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear nuevo usuario
      usuario = await userService.createUser(userId, {
        email: email,
        nombre: name,
        picture: picture,
        googleId: id,
        verificado: true,
        modo: 'COMMUNITY',
        puntos: 0,
        nivel: 1,
        reportesEnviados: 0,
        garage: {
          colorBondi: '#4F46E5',
          accesorios: []
        },
        favoritos: [],
        rutinas: [],
        historial: []
      });
      console.log(`✅ Nuevo usuario registrado: ${email}`);
    } else {
      // Actualizar datos básicos si cambiaron
      await userService.updateUser(usuario.userId, {
        nombre: name,
        picture: picture,
        googleId: id,
        verificado: true
      });
      // Asegurarse de tener el objeto más reciente
      usuario = await userService.getUser(usuario.userId);
    }

    // Guardar sesión en Firestore
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días

    await db.collection(SESSIONS_COLLECTION).doc(session_token).set({
      userId: usuario.userId,
      email: email,
      session_token: session_token,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    });

    // Configurar cookie
    res.cookie('session_token', session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/'
    });

    console.log(`🔐 Sesión creada para: ${email}`);

    res.json({
      status: 'ok',
      usuario: {
        userId: usuario.userId,
        email: usuario.email,
        nombre: usuario.nombre,
        picture: usuario.picture,
        verificado: true,
        nivel: usuario.nivel || 1,
        puntos: usuario.puntos || 0,
        reportesEnviados: usuario.reportesEnviados || 0
      }
    });
  } catch (error) {
    console.error('❌ Error procesando sesión:', error.message);
    res.status(401).json({
      error: 'Error de autenticación',
      message: error.response?.data?.detail || error.message
    });
  }
});

/**
 * 👤 RUTA 2: Obtener usuario actual (verificar sesión)
 */
router.get('/me', async (req, res) => {
  // Obtener token de cookie o header
  const sessionToken = req.cookies?.session_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    // Buscar sesión en Firestore
    const sessionDoc = await db.collection(SESSIONS_COLLECTION).doc(sessionToken).get();

    if (!sessionDoc.exists) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const session = sessionDoc.data();

    // Verificar expiración
    let expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    // Obtener usuario
    const usuario = await userService.getUser(session.userId);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      userId: usuario.userId,
      email: usuario.email,
      nombre: usuario.nombre,
      picture: usuario.picture,
      verificado: true,
      nivel: usuario.nivel || 1,
      puntos: usuario.puntos || 0,
      reportesEnviados: usuario.reportesEnviados || 0
    });
  } catch (error) {
    console.error('❌ Error verificando sesión:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

/**
 * 🚪 RUTA 3: Logout
 */
router.post('/logout', async (req, res) => {
  const sessionToken = req.cookies?.session_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (sessionToken) {
    try {
      await db.collection(SESSIONS_COLLECTION).doc(sessionToken).delete();
    } catch (error) {
      console.error('Error eliminando sesión:', error);
    }
  }

  res.clearCookie('session_token', { path: '/' });
  res.json({ status: 'ok', mensaje: 'Sesión cerrada' });
});

export default router;
