import express from 'express';
import { db, admin } from '../firebase.js';
import { analizarIncidente } from '../services/geminiService.js';

const router = express.Router();

// Referencia a la colección de bondis
const bondisRef = db.collection('colectivos');

// 📍 RUTA 1: El "Viajero" envía su ping (GPS)
router.post('/ping', async (req, res) => {
  const { linea, lat, lng, velocidad, rumbo } = req.body;

  // Validación de campos requeridos
  if (!linea || lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Faltan datos requeridos',
      required: ['linea', 'lat', 'lng']
    });
  }

  // Validar coordenadas
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'Coordenadas inválidas' });
  }

  try {
    // En Firestore, usamos la línea como ID del documento. 
    // Si existe, lo actualiza (merge). Si no, lo crea.
    // .doc("152") -> crea/busca el documento con ID "152"
    await bondisRef.doc(String(linea)).set({
      linea, // Guardamos la línea también como campo por si acaso
      ubicacion: { lat: latNum, lng: lngNum },
      velocidad: velocidad || 0,
      rumbo: rumbo || 0,
      esVerificado: true,
      ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp() // Hora del servidor Google
    }, { merge: true }); // 'merge: true' es clave para no borrar otros campos (como los reportes)

    res.json({ status: 'ok', mensaje: `Línea ${linea} actualizada` });
  } catch (error) {
    console.error("Error en Firebase:", error);
    res.status(500).json({ error: 'Error actualizando GPS' });
  }
});

// 🤖 RUTA 2: Reporte Inteligente con Gemini
router.post('/reportar', async (req, res) => {
  const { texto, linea } = req.body;

  // Validación: el texto va directo a Gemini, sin tope es un vector de abuso de cuota.
  if (!texto || typeof texto !== 'string' || !linea) {
    return res.status(400).json({ error: 'Faltan datos requeridos (texto, linea)' });
  }
  if (texto.length > 500) {
    return res.status(400).json({ error: 'Texto demasiado largo (máx. 500 caracteres)' });
  }
  if (!/^[0-9A-Za-zÁ-ú ]{1,12}$/.test(String(linea))) {
    return res.status(400).json({ error: 'Línea inválida' });
  }

  try {
    // 1. Analizamos con Gemini (Igual que antes)
    const analisisIA = await analizarIncidente(texto);
    let resultado;
    try {
      resultado = JSON.parse(analisisIA);
    } catch (e) {
      // Fallback si el parsing falla (aunque gemini 2.5 suele ser robusto con schemas)
      resultado = {
        categoria: 'DATO_IRRELEVANTE',
        resumen_corto: texto,
        consejo: "Gracias por tu reporte."
      };
    }

    // 2. Guardamos en Firestore
    // set(merge) y no update(): update() falla con NOT_FOUND si la línea
    // todavía no tiene doc (primer reporte sin ping previo).
    await bondisRef.doc(String(linea)).set({
      linea,
      reportes: admin.firestore.FieldValue.arrayUnion({
        tipo: resultado.categoria,
        resumen: resultado.resumen_corto,
        timestamp: new Date().toISOString() // Guardamos como string ISO para facilitar lectura
      })
    }, { merge: true });

    res.json({
      mensaje: "Reporte procesado en la nube",
      analisis: resultado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando reporte' });
  }
});

// 📡 RUTA 3: Obtener todos los bondis (Para el Mapa)
// Reemplaza a tu polling anterior
// 📡 RUTA 3: Obtener todos los bondis (Para el Mapa)
// Reemplaza a tu polling anterior
router.get('/', async (req, res) => {
  try {
    const hace5Minutos = new Date(Date.now() - 5 * 60 * 1000);

    const snapshot = await bondisRef
      .where('ultimaActualizacion', '>', hace5Minutos)
      .get();

    const bondis = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ultimaActualizacion && data.ultimaActualizacion.toDate) {
        data.ultimaActualizacion = data.ultimaActualizacion.toDate();
      }
      bondis.push({ id: doc.id, ...data });
    });

    res.json({ status: 'ok', colectivos: bondis });
  } catch (error) {
    console.error("Error obteniendo bondis:", error);
    res.status(500).json({ error: 'Error obteniendo bondis' });
  }
});

// Alias /activos -> / (para compatibilidad)
router.get('/activos', async (req, res) => {
  // Reutilizar lógica de '/'
  try {
    const hace5Minutos = new Date(Date.now() - 5 * 60 * 1000);
    const snapshot = await bondisRef.where('ultimaActualizacion', '>', hace5Minutos).get();
    const bondis = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ultimaActualizacion && data.ultimaActualizacion.toDate) {
        data.ultimaActualizacion = data.ultimaActualizacion.toDate();
      }
      bondis.push({ id: doc.id, ...data });
    });
    res.json({ status: 'ok', colectivos: bondis });
  } catch (e) {
    console.error('Error obteniendo bondis activos:', e);
    res.status(500).json({ error: 'Error obteniendo bondis' });
  }
});

// RUTA 4: Buscar por línea
router.get('/linea/:linea', async (req, res) => {
  const { linea } = req.params;
  try {
    const hace5Minutos = new Date(Date.now() - 5 * 60 * 1000);
    // En Firestore la linea es el ID, pero tambien guardamos 'linea' como campo.
    // Si buscamos por campo:
    const snapshot = await bondisRef
      .where('linea', '==', linea)
      .where('ultimaActualizacion', '>', hace5Minutos)
      .get();

    const bondis = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ultimaActualizacion && data.ultimaActualizacion.toDate) data.ultimaActualizacion = data.ultimaActualizacion.toDate();
      bondis.push({ id: doc.id, ...data });
    });
    res.json({ status: 'ok', colectivos: bondis });
  } catch (e) {
    res.status(500).json({ error: 'Error buscando linea' });
  }
});

export default router;