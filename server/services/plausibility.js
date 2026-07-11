// Motor de plausibilidad anti-spoofing para los pings GPS.
//
// Amenaza: un atacante inyecta pings falsos simulando un colectivo que se
// acerca a una parada (emboscada). Defensa: el estado "verificado" ya no se
// regala con un ping — se gana con una trayectoria sostenida y plausible de
// una MISMA sesión, más el requisito de figurar en usuariosActivos (subir).
//
// PRIVACIDAD: el track (userId + posiciones) vive SOLO en memoria y con TTL.
// Nunca se persiste el userId junto a una posición; en Firestore la posición
// sigue siendo anónima. Al reiniciar el server los tracks se pierden y los
// pasajeros re-gradúan en ~40s (aceptable, single instance).

export const CONFIG = {
  // AMBA con margen: CABA, GBA, La Plata, Luján y el corredor Zárate-Campana
  AMBA: { latMin: -35.35, latMax: -34.05, lngMin: -59.35, lngMax: -57.65 },
  MAX_SPEED_MS: 30,             // 108 km/h: techo generoso para un bondi
  FUZZ_SLACK_M: 100,            // el cliente aplica fuzz ±50m en cada punta
  MIN_PINGS_GRADUACION: 3,      // pings "contados" para graduarse
  MIN_ESPACIADO_MS: 8000,       // un ping cuenta solo si pasaron ≥8s del último contado
  MIN_DESPLAZAMIENTO_M: 200,    // neto desde el primer ping contado
  DOC_FRESCO_MS: 120000,        // el teleport-check contra el doc solo protege posiciones verificadas y frescas
  TRACK_TTL_MS: 10 * 60 * 1000,
  MAX_TRACKS: 5000,
  SWEEP_INTERVAL_MS: 5 * 60 * 1000
};

// Misma regla que /reportar; además evita docIds raros en Firestore.
export const LINEA_REGEX = /^[0-9A-Za-zÁ-ú ]{1,12}$/;

// Map<userId, { linea, last: {lat,lng,t}, lastContado: number, contados, origen: {lat,lng}, graduado, lastSeen }>
const tracks = new Map();

export function isInAmba(lat, lng) {
  const { latMin, latMax, lngMin, lngMax } = CONFIG.AMBA;
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

// Haversine en metros (el server no tiene utils compartidos con el front)
export function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Sobre de plausibilidad entre dos puntos separados dtMs milisegundos.
export function saltoPlausible(distM, dtMs) {
  return distM <= CONFIG.FUZZ_SLACK_M + CONFIG.MAX_SPEED_MS * (dtMs / 1000);
}

/**
 * Evalúa un ping contra el track en memoria de la sesión.
 * @returns {{ok: false, motivo: string} | {ok: true, graduado: boolean}}
 */
export function evaluarPing({ userId, linea, lat, lng, now = Date.now() }) {
  let track = tracks.get(userId);

  // Track nuevo, o cambio de línea: probation desde cero
  // (una persona viaja en un solo bondi a la vez).
  if (!track || track.linea !== linea) {
    if (!track && tracks.size >= CONFIG.MAX_TRACKS) {
      evictOldest();
    }
    track = {
      linea,
      last: { lat, lng, t: now },
      lastContado: now,
      contados: 1,
      origen: { lat, lng },
      graduado: false,
      lastSeen: now
    };
    tracks.set(userId, track);
    return { ok: true, graduado: false };
  }

  // Chequeo de velocidad dentro de la sesión: un teleport borra la probation.
  const dist = distanciaMetros(track.last.lat, track.last.lng, lat, lng);
  const dt = Math.max(1, now - track.last.t);
  if (!saltoPlausible(dist, dt)) {
    tracks.delete(userId);
    return { ok: false, motivo: 'salto_imposible' };
  }

  track.last = { lat, lng, t: now };
  track.lastSeen = now;

  // Solo cuentan los pings espaciados (evita ráfagas para graduar rápido)
  if (now - track.lastContado >= CONFIG.MIN_ESPACIADO_MS) {
    track.contados += 1;
    track.lastContado = now;
  }

  // Graduación: trayectoria sostenida + desplazamiento neto real.
  // Una vez graduado queda latcheado mientras viva el track.
  if (!track.graduado &&
    track.contados >= CONFIG.MIN_PINGS_GRADUACION &&
    distanciaMetros(track.origen.lat, track.origen.lng, lat, lng) >= CONFIG.MIN_DESPLAZAMIENTO_M) {
    track.graduado = true;
  }

  return { ok: true, graduado: track.graduado };
}

function evictOldest() {
  let oldestKey = null;
  let oldestSeen = Infinity;
  for (const [key, t] of tracks) {
    if (t.lastSeen < oldestSeen) {
      oldestSeen = t.lastSeen;
      oldestKey = key;
    }
  }
  if (oldestKey) tracks.delete(oldestKey);
}

export function limpiarTracks(now = Date.now()) {
  for (const [key, t] of tracks) {
    if (now - t.lastSeen > CONFIG.TRACK_TTL_MS) {
      tracks.delete(key);
    }
  }
}

export function _resetParaTests() {
  tracks.clear();
}

// Sweep propio (no cuelga del janitor de server.js: ese solo corre con DB real,
// y esto tiene que funcionar también en mock/dev). unref() para no colgar tests.
const sweepTimer = setInterval(limpiarTracks, CONFIG.SWEEP_INTERVAL_MS);
if (sweepTimer.unref) sweepTimer.unref();
