import express from 'express';
import { db, admin } from '../firebase.js';
import userService from '../services/userService.js';
import { LINEA_REGEX } from '../services/plausibility.js';

const router = express.Router();

// Misma colección que /api/bondi: docId = String(linea), ramal como campo.
const bondisRef = db.collection('colectivos');

// Anti-spoofing: tope de pasajeros activos por línea (evita inflar el array
// rotando cookies gratis; ninguna línea real junta 50 usuarios compartiendo).
const MAX_USUARIOS_ACTIVOS = 50;

/**
 * 🚌 RUTA 1: Actualizar estado del colectivo (real vs estimado)
 */
router.post('/actualizar-estado', async (req, res) => {
  const { linea, ramal, esEstimado } = req.body;

  if (!linea || !LINEA_REGEX.test(String(linea))) {
    return res.status(400).json({ error: 'Línea requerida' });
  }

  try {
    // Sin coordenadas no se refresca ultimaActualizacion salvo para marcar
    // estimado (posición vieja en gris): "revivir" un bus es dominio del ping.
    const payload = {
      linea,
      ramal: ramal || 'default',
      esEstimado: !!esEstimado
    };
    if (esEstimado) {
      payload.esVerificado = false;
      payload.ultimaActualizacion = admin.firestore.FieldValue.serverTimestamp();
    }
    await bondisRef.doc(String(linea)).set(payload, { merge: true });

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

  if (!linea || !LINEA_REGEX.test(String(linea)) || !['subir', 'bajar'].includes(accion)) {
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

      // Anti-spoofing: "subir" solo registra al pasajero. NUNCA escribe
      // esVerificado ni refresca ultimaActualizacion — sin coordenadas no se
      // crea ni "revive" un bus visible. esVerificado es dominio exclusivo
      // del motor de plausibilidad del ping.
      if (accion === 'subir') {
        if (!activos.includes(userId) && activos.length < MAX_USUARIOS_ACTIVOS) {
          activos.push(userId);
          otorgarPuntos = true; // +5 solo la primera vez que sube (dedupe natural)
        }
        esEstimado = !!data.esEstimado;
        usuariosActivos = activos.length;

        t.set(docRef, {
          linea,
          ramal: ramal || 'default',
          usuariosActivos: activos,
          ultimoAbordaje: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return;
      }

      // 'bajar': solo toca los flags si la línea quedó sin pasajeros
      // (última posición conocida en gris). Si quedan otros, los flags los
      // sigue manejando el ping del pasajero graduado.
      activos = activos.filter(id => id !== userId);
      esEstimado = activos.length === 0;
      usuariosActivos = activos.length;

      const payload = {
        linea,
        ramal: ramal || 'default',
        usuariosActivos: activos
      };
      if (esEstimado) {
        console.log(`👻 Colectivo ${linea} ahora es ESTIMADO (sin usuarios)`);
        payload.esEstimado = true;
        payload.esVerificado = false;
        payload.ultimaActualizacion = admin.firestore.FieldValue.serverTimestamp();
      }
      t.set(docRef, payload, { merge: true });
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
