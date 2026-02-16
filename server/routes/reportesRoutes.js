import express from 'express';
import { db, admin } from '../firebase.js';
import { analizarIncidente } from '../services/geminiService.js';

const router = express.Router();

// Referencia a la colección de reportes
const reportesRef = db.collection('reportes_comunitarios');

// Configuraciones
const UMBRAL_CONFIRMACION = 3;
const EXPIRACION_HORAS = 2;

/**
 * Crear un nuevo reporte con ID autogenerado
 */
async function crearReporte(datos) {
  const ahora = new Date();
  const expiresAt = new Date(ahora.getTime() + EXPIRACION_HORAS * 60 * 60 * 1000);

  // Determinar si requiere confirmación
  const requiereConfirmacion = ['lleno', 'desvio'].includes(datos.tipo);

  const reporte = {
    ...datos,
    activo: true,
    confianza: 1,
    estadoConfirmacion: requiereConfirmacion ? 'pendiente' : 'confirmado',
    usuariosConfirmaron: [],
    validaciones: [],
    contadores: {
      yoTambien: 0,
      yaNoPasa: 0,
      gracias: 0
    },
    umbralConfirmacion: UMBRAL_CONFIRMACION,
    createdAt: ahora.toISOString(),
    expiresAt: expiresAt.toISOString(),
    updatedAt: ahora.toISOString()
  };

  const docRef = await reportesRef.add(reporte);
  return { id: docRef.id, ...reporte };
}

/**
 * 📢 RUTA 1: Crear reporte comunitario
 */
router.post('/crear', async (req, res) => {
  const { userId, tipo, linea, ramal, lat, lng, comentario } = req.body;

  // Validación de campos requeridos
  if (!userId || !tipo || !linea || lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Faltan datos requeridos',
      required: ['userId', 'tipo', 'linea', 'lat', 'lng']
    });
  }

  // Validar tipo
  const tiposValidos = ['lleno', 'vacio', 'demora', 'accidente', 'piquete', 'inseguridad', 'fantasma', 'desvio'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      error: 'Tipo de reporte inválido',
      tiposValidos
    });
  }

  try {
    const reporte = await crearReporte({
      userId,
      tipo,
      linea,
      ramal: ramal || 'default',
      ubicacion: { lat: parseFloat(lat), lng: parseFloat(lng) },
      comentario: comentario || ''
    });

    console.log(`📢 Nuevo reporte: ${tipo} en línea ${linea} por usuario ${userId}`);

    res.json({
      status: 'ok',
      mensaje: '¡Reporte enviado! +10 puntos',
      reporte: reporte,
      puntos: 10
    });
  } catch (error) {
    console.error('❌ Error creando reporte:', error);
    res.status(500).json({
      error: 'Error creando reporte',
      message: error.message
    });
  }
});

/**
 * 🔍 RUTA 2: Obtener reportes activos cercanos
 */
router.get('/cercanos', async (req, res) => {
  const { lat, lng, radio = 5000, incluirPendientes = false } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Se requieren coordenadas (lat, lng)' });
  }

  try {
    const ahora = new Date().toISOString();

    // Obtener todos los reportes activos no expirados
    let query = reportesRef
      .where('activo', '==', true)
      .where('expiresAt', '>', ahora);

    // Por defecto, solo mostrar reportes confirmados
    if (incluirPendientes !== 'true') {
      query = query.where('estadoConfirmacion', '==', 'confirmado');
    }

    const snapshot = await query.orderBy('expiresAt').orderBy('createdAt', 'desc').limit(50).get();

    const reportes = [];
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radioMetros = parseInt(radio);

    snapshot.forEach(doc => {
      const data = doc.data();
      // Filtrar por distancia manualmente (Firestore no tiene búsqueda geoespacial nativa)
      if (data.ubicacion) {
        const distancia = calcularDistancia(latNum, lngNum, data.ubicacion.lat, data.ubicacion.lng);
        if (distancia <= radioMetros) {
          reportes.push({ id: doc.id, ...data, distancia: Math.round(distancia) });
        }
      }
    });

    // Ordenar por distancia
    reportes.sort((a, b) => a.distancia - b.distancia);

    res.json({
      status: 'ok',
      count: reportes.length,
      reportes: reportes.slice(0, 20)
    });
  } catch (error) {
    console.error('❌ Error obteniendo reportes cercanos:', error);
    res.status(500).json({
      error: 'Error obteniendo reportes',
      message: error.message
    });
  }
});

/**
 * Calcular distancia entre dos puntos en metros (fórmula Haversine)
 */
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 👍 RUTA 3: Validar reporte (Yo también, Ya no pasa, Gracias)
 */
router.post('/validar', async (req, res) => {
  const { reporteId, userId, tipo = 'yo_tambien' } = req.body;

  if (!reporteId || !userId) {
    return res.status(400).json({ error: 'Faltan datos requeridos (reporteId, userId)' });
  }

  try {
    const docRef = reportesRef.doc(reporteId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const reporte = doc.data();

    // Verificar si el usuario ya validó
    const yaValido = reporte.validaciones?.some(v => v.userId === userId);
    if (yaValido) {
      return res.json({
        status: 'ok',
        mensaje: 'Ya validaste este reporte'
      });
    }

    // Agregar validación
    const nuevaValidacion = { userId, tipo, timestamp: new Date().toISOString() };
    const contadores = { ...reporte.contadores };
    let confianza = reporte.confianza || 1;

    if (tipo === 'yo_tambien') {
      contadores.yoTambien = (contadores.yoTambien || 0) + 1;
      confianza = Math.min(10, confianza + 0.5);
    } else if (tipo === 'ya_no') {
      contadores.yaNoPasa = (contadores.yaNoPasa || 0) + 1;
    } else if (tipo === 'gracias') {
      contadores.gracias = (contadores.gracias || 0) + 1;
    }

    // Desactivar si hay muchos "ya no pasa"
    const activo = contadores.yaNoPasa >= 3 ? false : reporte.activo;

    await docRef.update({
      validaciones: admin.firestore.FieldValue.arrayUnion(nuevaValidacion),
      contadores,
      confianza,
      activo,
      updatedAt: new Date().toISOString()
    });

    let mensaje = '';
    let puntos = 0;

    if (tipo === 'yo_tambien') {
      mensaje = '¡Gracias por validar! +5 puntos';
      puntos = 5;
    } else if (tipo === 'ya_no') {
      mensaje = 'Marcado como resuelto. +3 puntos';
      puntos = 3;
    } else if (tipo === 'gracias') {
      mensaje = '¡Gracias enviado!';
      puntos = 1;
    }

    res.json({
      status: 'ok',
      mensaje,
      puntos,
      contadores
    });
  } catch (error) {
    console.error('❌ Error validando reporte:', error);
    res.status(500).json({
      error: 'Error validando reporte',
      message: error.message
    });
  }
});

/**
 * ✅ RUTA 3.5: Confirmar reporte (para lleno y desvío)
 */
router.post('/confirmar', async (req, res) => {
  const { reporteId, userId } = req.body;

  if (!reporteId || !userId) {
    return res.status(400).json({ error: 'Faltan datos requeridos (reporteId, userId)' });
  }

  try {
    const docRef = reportesRef.doc(reporteId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const reporte = doc.data();

    // Solo para reportes pendientes
    if (reporte.estadoConfirmacion !== 'pendiente') {
      return res.json({
        status: 'error',
        mensaje: 'Reporte ya procesado'
      });
    }

    // No puede confirmar su propio reporte
    if (reporte.userId === userId) {
      return res.json({
        status: 'error',
        mensaje: 'No podés confirmar tu propio reporte'
      });
    }

    // Verificar si ya confirmó
    const yaConfirmo = reporte.usuariosConfirmaron?.some(u => u.userId === userId);
    if (yaConfirmo) {
      return res.json({
        status: 'error',
        mensaje: 'Ya confirmaste este reporte'
      });
    }

    // Agregar confirmación
    const nuevaConfirmacion = { userId, timestamp: new Date().toISOString() };
    const usuariosConfirmaron = [...(reporte.usuariosConfirmaron || []), nuevaConfirmacion];

    // Verificar si alcanzó el umbral
    const umbral = reporte.umbralConfirmacion || UMBRAL_CONFIRMACION;
    const estadoConfirmacion = usuariosConfirmaron.length >= umbral ? 'confirmado' : 'pendiente';

    await docRef.update({
      usuariosConfirmaron,
      estadoConfirmacion,
      updatedAt: new Date().toISOString()
    });

    let puntos = 0;
    let mensaje = '';

    if (estadoConfirmacion === 'confirmado') {
      puntos = 5;
      mensaje = '✅ ¡Reporte confirmado! Gracias por ayudar a la comunidad. +5 puntos';
      console.log(`✅ Reporte ${reporteId} CONFIRMADO (${usuariosConfirmaron.length} usuarios)`);
    } else {
      puntos = 2;
      const faltan = umbral - usuariosConfirmaron.length;
      mensaje = `✅ Confirmación registrada. Faltan ${faltan} confirmaciones más. +2 puntos`;
    }

    res.json({
      status: 'ok',
      mensaje,
      puntos,
      estadoConfirmacion,
      confirmaciones: usuariosConfirmaron.length,
      faltanConfirmaciones: Math.max(0, umbral - usuariosConfirmaron.length)
    });
  } catch (error) {
    console.error('❌ Error confirmando reporte:', error);
    res.status(500).json({
      error: 'Error confirmando reporte',
      message: error.message
    });
  }
});

/**
 * 📋 RUTA 4: Obtener reportes por línea
 */
router.get('/linea/:linea', async (req, res) => {
  const { linea } = req.params;

  try {
    const ahora = new Date().toISOString();

    const snapshot = await reportesRef
      .where('linea', '==', linea)
      .where('activo', '==', true)
      .where('expiresAt', '>', ahora)
      .orderBy('expiresAt')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const reportes = [];
    snapshot.forEach(doc => {
      reportes.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      status: 'ok',
      linea,
      count: reportes.length,
      reportes
    });
  } catch (error) {
    console.error('❌ Error obteniendo reportes por línea:', error);
    res.status(500).json({
      error: 'Error obteniendo reportes',
      message: error.message
    });
  }
});

/**
 * ⏳ RUTA 4.5: Obtener reportes pendientes de confirmación
 */
router.get('/pendientes/:linea', async (req, res) => {
  const { linea } = req.params;
  const { userId } = req.query;

  try {
    const ahora = new Date().toISOString();

    const snapshot = await reportesRef
      .where('linea', '==', linea)
      .where('estadoConfirmacion', '==', 'pendiente')
      .where('activo', '==', true)
      .where('expiresAt', '>', ahora)
      .orderBy('expiresAt')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const reportes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Excluir reportes del propio usuario y ya confirmados por él
      if (data.userId !== userId &&
        !data.usuariosConfirmaron?.some(u => u.userId === userId)) {
        reportes.push({
          id: doc.id,
          tipo: data.tipo,
          linea: data.linea,
          ramal: data.ramal,
          ubicacion: data.ubicacion,
          comentario: data.comentario,
          confirmacionesActuales: data.usuariosConfirmaron?.length || 0,
          confirmacionesNecesarias: data.umbralConfirmacion || UMBRAL_CONFIRMACION,
          createdAt: data.createdAt
        });
      }
    });

    res.json({
      status: 'ok',
      linea,
      count: reportes.length,
      reportes
    });
  } catch (error) {
    console.error('❌ Error obteniendo reportes pendientes:', error);
    res.status(500).json({
      error: 'Error obteniendo reportes',
      message: error.message
    });
  }
});

/**
 * 🔔 RUTA 4.6: Obtener desvíos confirmados
 */
router.get('/desvios-confirmados/:linea', async (req, res) => {
  const { linea } = req.params;

  try {
    const ahora = new Date().toISOString();

    const snapshot = await reportesRef
      .where('linea', '==', linea)
      .where('tipo', '==', 'desvio')
      .where('estadoConfirmacion', '==', 'confirmado')
      .where('activo', '==', true)
      .where('expiresAt', '>', ahora)
      .orderBy('expiresAt')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const desvios = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      desvios.push({
        id: doc.id,
        linea: data.linea,
        ramal: data.ramal,
        ubicacion: data.ubicacion,
        comentario: data.comentario,
        confirmaciones: data.usuariosConfirmaron?.length || 0,
        confirmedAt: data.updatedAt
      });
    });

    res.json({
      status: 'ok',
      count: desvios.length,
      desvios
    });
  } catch (error) {
    console.error('❌ Error obteniendo desvíos confirmados:', error);
    res.status(500).json({
      error: 'Error obteniendo desvíos',
      message: error.message
    });
  }
});

/**
 * 🗑️ RUTA 5: Eliminar/desactivar reporte
 */
router.delete('/:reporteId', async (req, res) => {
  const { reporteId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId requerido' });
  }

  try {
    const docRef = reportesRef.doc(reporteId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const reporte = doc.data();

    // Verificar que sea el creador
    if (reporte.userId !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await docRef.update({
      activo: false,
      updatedAt: new Date().toISOString()
    });

    res.json({
      status: 'ok',
      mensaje: 'Reporte eliminado'
    });
  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    res.status(500).json({
      error: 'Error eliminando reporte',
      message: error.message
    });
  }
});

export default router;