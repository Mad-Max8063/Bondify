import express from 'express';
import userService from '../services/userService.js';

const router = express.Router();

/**
 * 👤 RUTA 1: Obtener o crear perfil de usuario
 */
router.post('/perfil', async (req, res) => {
  const { userId, nombre, modo } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId es requerido' });
  }

  try {
    let usuario = await userService.getUser(userId);

    if (!usuario) {
      // Crear nuevo usuario
      usuario = await userService.createUser(userId, {
        nombre: nombre || 'Usuario',
        modo: modo || 'EFFICIENT'
      });
      console.log(`✅ Nuevo usuario creado (Firebase): ${userId}`);
    } else {
      // Actualizar última actividad
      usuario = await userService.updateUser(userId, { ultimaActividad: new Date().toISOString() });
    }

    res.json({
      status: 'ok',
      usuario: usuario
    });
  } catch (error) {
    console.error('❌ Error en perfil:', error);
    res.status(500).json({
      error: 'Error obteniendo perfil',
      message: error.message
    });
  }
});

/**
 * ⭐ RUTA 2: Agregar línea a favoritos
 */
router.post('/favoritos/agregar', async (req, res) => {
  const { userId, linea, ramal } = req.body;

  if (!userId || !linea) {
    return res.status(400).json({ error: 'userId y linea son requeridos' });
  }

  try {
    const usuario = await userService.getUser(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya existe
    const yaExiste = (usuario.favoritos || []).some(
      f => f.linea === linea && f.ramal === (ramal || 'default')
    );

    if (yaExiste) {
      return res.json({
        status: 'ok',
        mensaje: 'Ya está en favoritos'
      });
    }

    // Agregar a favoritos
    const usuarioActualizado = await userService.addFavorite(userId, {
      linea,
      ramal: ramal || 'default'
    });

    res.json({
      status: 'ok',
      mensaje: 'Agregado a favoritos',
      favoritos: usuarioActualizado.favoritos
    });
  } catch (error) {
    console.error('❌ Error agregando favorito:', error);
    res.status(500).json({
      error: 'Error agregando favorito',
      message: error.message
    });
  }
});

/**
 * ❌ RUTA 3: Eliminar de favoritos
 */
router.post('/favoritos/eliminar', async (req, res) => {
  const { userId, linea, ramal } = req.body;

  if (!userId || !linea) {
    return res.status(400).json({ error: 'userId y linea son requeridos' });
  }

  try {
    const nuevosFavoritos = await userService.removeFavorite(userId, linea, ramal);

    res.json({
      status: 'ok',
      mensaje: 'Eliminado de favoritos',
      favoritos: nuevosFavoritos
    });
  } catch (error) {
    console.error('❌ Error eliminando favorito:', error);
    res.status(500).json({
      error: 'Error eliminando favorito',
      message: error.message
    });
  }
});

/**
 * 🔄 RUTA 4: Crear o actualizar rutina
 */
router.post('/rutinas/guardar', async (req, res) => {
  const { userId, rutina } = req.body;

  if (!userId || !rutina || !rutina.linea) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const rutinas = await userService.addRoutine(userId, {
      linea: rutina.linea,
      ramal: rutina.ramal || 'default',
      horaSalida: rutina.horaSalida,
      horaRegreso: rutina.horaRegreso,
      diasSemana: rutina.diasSemana || [1, 2, 3, 4, 5],
      activa: true,
      paradaOrigen: rutina.paradaOrigen,
      paradaDestino: rutina.paradaDestino
    });

    res.json({
      status: 'ok',
      mensaje: 'Rutina guardada',
      rutinas: rutinas
    });
  } catch (error) {
    console.error('❌ Error guardando rutina:', error);
    res.status(500).json({
      error: 'Error guardando rutina',
      message: error.message
    });
  }
});

/**
 * 📊 RUTA 5: Registrar viaje
 */
router.post('/historial/agregar', async (req, res) => {
  const { userId, viaje } = req.body;

  if (!userId || !viaje) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const historial = await userService.addHistory(userId, viaje);

    res.json({
      status: 'ok',
      mensaje: 'Viaje registrado',
      historial: historial.slice(-10) // Últimos 10
    });
  } catch (error) {
    console.error('❌ Error registrando viaje:', error);
    res.status(500).json({
      error: 'Error registrando viaje',
      message: error.message
    });
  }
});

/**
 * 🎮 RUTA 6: Actualizar garage/gamificación
 */
router.post('/garage/actualizar', async (req, res) => {
  const { userId, puntos, colorBondi, accesorio } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId requerido' });
  }

  try {
    const usuario = await userService.updateGarage(userId, { puntos, colorBondi, accesorio });

    res.json({
      status: 'ok',
      mensaje: 'Garage actualizado',
      garage: usuario.garage
    });
  } catch (error) {
    console.error('❌ Error actualizando garage:', error);
    res.status(500).json({
      error: 'Error actualizando garage',
      message: error.message
    });
  }
});

/**
 * 📊 RUTA 7: Obtener estadísticas
 */
router.get('/estadisticas/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const usuario = await userService.getUser(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calcular estadísticas adicionales (en memoria por ahora, o ya vienen del service)
    const viajesPorLinea = {};
    (usuario.historial || []).forEach(viaje => {
      const key = `${viaje.linea} ${viaje.ramal !== 'default' ? viaje.ramal : ''}`;
      viajesPorLinea[key] = (viajesPorLinea[key] || 0) + 1;
    });

    const promedioTiempoViaje = usuario.estadisticas.viajesRealizados > 0
      ? Math.round(usuario.estadisticas.tiempoTotalViaje / usuario.estadisticas.viajesRealizados)
      : 0;

    res.json({
      status: 'ok',
      estadisticas: usuario.estadisticas,
      garage: usuario.garage,
      viajesPorLinea,
      promedioTiempoViaje,
      historialReciente: (usuario.historial || []).slice(-5)
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
});

export default router;
