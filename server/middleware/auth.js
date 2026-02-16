const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

/**
 * Middleware de autenticación
 * Verifica el session_token y añade el usuario a req.user
 */
const authMiddleware = async (req, res, next) => {
  // Obtener token de cookie o header
  const sessionToken = req.cookies?.session_token || 
    req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  try {
    const db = mongoose.connection.db;
    
    // Buscar sesión
    const session = await db.collection('user_sessions').findOne(
      { session_token: sessionToken },
      { projection: { _id: 0 } }
    );

    if (!session) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    // Verificar expiración
    let expiresAt = session.expires_at;
    if (typeof expiresAt === 'string') {
      expiresAt = new Date(expiresAt);
    }
    if (expiresAt < new Date()) {
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    // Obtener usuario
    const usuario = await Usuario.findOne(
      { userId: session.userId },
      { _id: 0 }
    );

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Añadir usuario a la request
    req.user = {
      userId: usuario.userId,
      email: usuario.email,
      nombre: usuario.nombre,
      picture: usuario.picture,
      verificado: true,
      nivel: usuario.nivel || 1,
      puntos: usuario.puntos || 0,
      reportesEnviados: usuario.reportesEnviados || 0
    };

    next();
  } catch (error) {
    console.error('❌ Error en auth middleware:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

/**
 * Middleware opcional de autenticación
 * No bloquea si no hay sesión, pero añade usuario si existe
 */
const optionalAuth = async (req, res, next) => {
  const sessionToken = req.cookies?.session_token || 
    req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    req.user = null;
    return next();
  }

  try {
    const db = mongoose.connection.db;
    const session = await db.collection('user_sessions').findOne(
      { session_token: sessionToken },
      { projection: { _id: 0 } }
    );

    if (session) {
      let expiresAt = session.expires_at;
      if (typeof expiresAt === 'string') expiresAt = new Date(expiresAt);
      
      if (expiresAt >= new Date()) {
        const usuario = await Usuario.findOne(
          { userId: session.userId },
          { _id: 0 }
        );
        
        if (usuario) {
          req.user = {
            userId: usuario.userId,
            email: usuario.email,
            nombre: usuario.nombre,
            verificado: true,
            nivel: usuario.nivel || 1,
            puntos: usuario.puntos || 0,
            reportesEnviados: usuario.reportesEnviados || 0
          };
        }
      }
    }
  } catch (error) {
    console.error('Error en optional auth:', error);
  }

  req.user = req.user || null;
  next();
};

module.exports = { authMiddleware, optionalAuth };
