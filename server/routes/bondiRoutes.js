import express from 'express';
import { db, admin } from '../firebase.js';
import { analizarIncidente } from '../services/geminiService.js';
import {
  CONFIG as PLAUSIBILITY,
  LINEA_REGEX,
  isInAmba,
  distanciaMetros,
  saltoPlausible,
  evaluarPing
} from '../services/plausibility.js';

const router = express.Router();

// Referencia a la colección de bondis
const bondisRef = db.collection('colectivos');

const clamp = (n, min, max) => Math.min(max, Math.max(min, Number(n) || 0));

// Normaliza ultimaActualizacion: Timestamp de Firestore real o ISO/Date del mock
const tsToDate = (v) => (v?.toDate ? v.toDate() : (v ? new Date(v) : null));

// Serialización por WHITELIST: usuariosActivos es un array de UUIDs de sesión
// y NUNCA debe salir al cliente (solo su length como pasajerosCount).
function serializarColectivo(doc) {
  const d = doc.data() || {};
  return {
    id: doc.id,
    linea: d.linea,
    ramal: d.ramal,
    ubicacion: d.ubicacion,
    velocidad: d.velocidad,
    rumbo: d.rumbo,
    esVerificado: !!d.esVerificado,
    esEstimado: !!d.esEstimado,
    reportes: d.reportes || [],
    ultimaActualizacion: tsToDate(d.ultimaActualizacion),
    pasajerosCount: Array.isArray(d.usuariosActivos) ? d.usuariosActivos.length : 0
  };
}

// 📍 RUTA 1: El "Viajero" envía su ping (GPS)
// Anti-spoofing: "verificado" ya no se regala con un ping — exige una
// trayectoria plausible sostenida de la MISMA sesión (motor de plausibilidad,
// en memoria) Y haber "subido" a la línea (usuariosActivos).
router.post('/ping', async (req, res) => {
  const { linea, lat, lng, velocidad, rumbo } = req.body;
  const userId = req.userId;

  // Validación de campos requeridos
  if (!linea || lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Faltan datos requeridos',
      required: ['linea', 'lat', 'lng']
    });
  }

  if (!LINEA_REGEX.test(String(linea))) {
    return res.status(400).json({ error: 'Línea inválida' });
  }

  // Validar coordenadas
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'Coordenadas inválidas' });
  }

  // Solo aceptamos posiciones dentro de la zona de cobertura (AMBA)
  if (!isInAmba(latNum, lngNum)) {
    return res.status(422).json({ error: 'Fuera de la zona de cobertura' });
  }

  // Telemetría saneada (informativa, nunca se usa para confiar)
  const vel = clamp(velocidad, 0, 40);
  const rumboNum = clamp(rumbo, 0, 360);

  // Plausibilidad de la trayectoria de esta sesión (teleport = probation perdida)
  const evaluacion = evaluarPing({ userId, linea: String(linea), lat: latNum, lng: lngNum });
  if (!evaluacion.ok) {
    return res.status(422).json({ error: 'Trayectoria implausible' });
  }

  try {
    const docSnap = await bondisRef.doc(String(linea)).get();
    const data = docSnap.exists ? (docSnap.data() || {}) : {};

    // Teleport-check ACOTADO contra el doc: solo protege una posición ya
    // verificada y fresca (que un ping anónimo no pueda teletransportar un
    // bus verde). Un doc sin verificar o viejo no puede bloquear a nadie
    // (evita que un atacante "ancle" la línea y censure al pasajero real).
    if (data.esVerificado === true && data.ubicacion) {
      const prevTs = tsToDate(data.ultimaActualizacion);
      const dtMs = prevTs ? Date.now() - prevTs.getTime() : Infinity;
      if (dtMs < PLAUSIBILITY.DOC_FRESCO_MS) {
        const dist = distanciaMetros(data.ubicacion.lat, data.ubicacion.lng, latNum, lngNum);
        if (!saltoPlausible(dist, dtMs)) {
          return res.status(422).json({ error: 'Posición inconsistente con el estado actual de la línea' });
        }
      }
    }

    // Verificado = trayectoria graduada + figura como pasajero activo (subir).
    // La comparación usa req.userId SOLO en memoria: jamás se persiste el
    // userId junto a la posición.
    const activos = Array.isArray(data.usuariosActivos) ? data.usuariosActivos : [];
    const esVerificado = evaluacion.graduado && activos.includes(userId);

    await bondisRef.doc(String(linea)).set({
      linea,
      ubicacion: { lat: latNum, lng: lngNum },
      velocidad: vel,
      rumbo: rumboNum,
      esVerificado,
      esEstimado: false,
      ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ status: 'ok', mensaje: `Línea ${linea} actualizada`, verificado: esVerificado });
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
      bondis.push(serializarColectivo(doc));
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
      bondis.push(serializarColectivo(doc));
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
      bondis.push(serializarColectivo(doc));
    });
    res.json({ status: 'ok', colectivos: bondis });
  } catch (e) {
    res.status(500).json({ error: 'Error buscando linea' });
  }
});

export default router;