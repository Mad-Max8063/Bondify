import crypto from 'crypto';

/**
 * Sesión anónima firmada (stateless).
 * Cookie `bfy_uid` = "v1.<uuid>.<hmac>" donde hmac = HMAC-SHA256("v1.<uuid>", SESSION_SECRET).
 * El userId de cada request sale SIEMPRE de esta cookie (nunca del body):
 * sin fricción de login, pero sin spoofing de identidad.
 *
 * Los pings GPS (/api/bondi/ping) no usan la sesión a propósito: la posición
 * viaja con el tripId rotativo del cliente y nunca se ata a la identidad de puntos.
 */

const COOKIE_NAME = 'bfy_uid';
const VERSION = 'v1';
const MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000; // 400 días

// Lazy: process.env recién está completo cuando dotenv ya corrió.
let cachedSecret = null;
function getSecret() {
  if (cachedSecret) return cachedSecret;

  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: SESSION_SECRET no está configurado. Abortando.');
      process.exit(1);
    }
    console.warn('⚠️  SESSION_SECRET no seteado: usando secreto de DEV (no usar en producción).');
  }

  cachedSecret = process.env.SESSION_SECRET || 'bondify-dev-secret-no-usar-en-produccion';
  return cachedSecret;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function mintSession() {
  const uuid = crypto.randomUUID();
  const payload = `${VERSION}.${uuid}`;
  return { userId: uuid, cookieValue: `${payload}.${sign(payload)}` };
}

function verifySession(cookieValue) {
  if (typeof cookieValue !== 'string') return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 3 || parts[0] !== VERSION) return null;

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(payload), 'hex');
  let received;
  try {
    received = Buffer.from(parts[2], 'hex');
  } catch {
    return null;
  }
  if (expected.length !== received.length) return null;
  if (!crypto.timingSafeEqual(expected, received)) return null;
  return parts[1];
}

export function sessionMiddleware(req, res, next) {
  let userId = verifySession(req.cookies?.[COOKIE_NAME]);

  if (!userId) {
    const fresh = mintSession();
    userId = fresh.userId;
    res.cookie(COOKIE_NAME, fresh.cookieValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE_MS,
      path: '/'
    });
  }

  req.userId = userId;
  next();
}
