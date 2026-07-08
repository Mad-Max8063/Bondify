import express from 'express';
import { db, admin } from '../firebase.js';
import userService from '../services/userService.js';

const router = express.Router();

// Misma colección que /api/bondi: docId = String(linea), ramal como campo.
const bondisRef = db.collection('colectivos');

/**
 * 🚌 RUTA 1: Actualizar estado del colectivo (real vs estimado)
 */
router.post('/actualizar-estado', async (req, res) => {
  const { linea, ramal, esEstimado } = req.body;

  if (!linea) {
    return res.status(400).json({ error: 'Línea requerida' });
  }

  try {
    await bondisRef.doc(String(linea)).set({
      linea,
      ramal: ramal || 'default',
      esEstimado: !!esEstimado,
      ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`🚌 Estado actualizado - Línea ${linea}: ${esEstimado ? 'ESTIMADO (gris)' : 'REAL (verde)'}`);

    res.json({
      status: 'ok',
      mensaje: `Colectivo marcado como ${esEstimado ? 'estimado' : 'real'}`
    });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

/**
 * 👥 RUTA 2: Registrar usuario viajando en colectivo
 */
router.post('/registrar-usuario', async (req, res) => {
  const { linea, ramal, accion } = req.body; // accion: 'subir' o 'bajar'
  const userId = req.userId;

  if (!linea || !accion) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const docRef = bondisRef.doc(String(linea));
    let usuariosActivos = 0;
    let esEstimado = false;
    let otorgarPuntos = false;

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      const data = doc.exists ? (doc.data() || {}) : {};
      let activos = Array.isArray(data.usuariosActivos) ? [...data.usuariosActivos] : [];

      if (accion === 'subir') {
        if (!activos.includes(userId)) {
          activos.push(userId);
          otorgarPuntos = true; // +5 solo la primera vez que sube (dedupe natural)
        }
        esEstimado = false;
      } else if (accion === 'bajar') {
        activos = activos.filter(id => id !== userId);
        esEstimado = activos.length === 0;
        if (esEstimado) {
          console.log(`👻 Colectivo ${linea} ahora es ESTIMADO (sin usuarios)`);
        }
      }

      usuariosActivos = activos.length;

      t.set(docRef, {
        linea,
        ramal: ramal || 'default',
        usuariosActivos: activos,
        esEstimado,
        esVerificado: !esEstimado,
        ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    if (otorgarPuntos) {
      await userService.awardPoints(userId, 5);
    }

    res.json({
      status: 'ok',
      mensaje: `Usuario ${accion === 'subir' ? 'subió' : 'bajó'}`,
      usuariosActivos,
      esEstimado,
      puntos: otorgarPuntos ? 5 : 0
    });
  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
});

/**
 * 📊 RUTA 3: Obtener estado de colectivo
 */
router.get('/estado/:linea', async (req, res) => {
  const { linea } = req.params;

  try {
    const doc = await bondisRef.doc(String(linea)).get();

    if (!doc.exists) {
      return res.json({
        status: 'ok',
        esEstimado: true,
        usuariosActivos: 0,
        mensaje: 'Colectivo no encontrado'
      });
    }

    const data = doc.data() || {};
    let ultimaActualizacion = data.ultimaActualizacion;
    if (ultimaActualizacion && ultimaActualizacion.toDate) {
      ultimaActualizacion = ultimaActualizacion.toDate();
    }

    res.json({
      status: 'ok',
      esEstimado: data.esEstimado || false,
      usuariosActivos: data.usuariosActivos?.length || 0,
      ultimaActualizacion
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({ error: 'Error obteniendo estado' });
  }
});

export default router;
