/**
 * Verificación E2E de las defensas anti-spoofing, ejecutada COMO UN ATAQUE REAL.
 *
 * Uso (dos terminales):
 *   1) npm start            (sin credenciales arranca en MOCK, puerto 8001)
 *   2) node scripts/ataque-e2e.cjs
 *
 * También corre contra un server con Firestore real local.
 * BACKEND_URL para apuntar a otro host (NO correr contra producción con flood).
 *
 * Duración total ~3 min (sleeps de trayectoria + ventana del rate limit).
 */

const axios = require('axios');

const BASE = process.env.BACKEND_URL || 'http://localhost:8001';

// Palermo; ~0.0011° lat ≈ 122 m por paso
const LAT0 = -34.5828;
const LNG0 = -58.4215;
const PASO = 0.0011;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Cookie jar mínimo: axios no maneja cookies solo.
class Jar {
  constructor() { this.cookies = {}; }
  absorb(res) {
    const set = res.headers?.['set-cookie'] || [];
    for (const c of set) {
      const [pair] = c.split(';');
      const idx = pair.indexOf('=');
      this.cookies[pair.slice(0, idx)] = pair.slice(idx + 1);
    }
  }
  header() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function req(jar, method, path, data) {
  const res = await axios({
    method,
    url: `${BASE}${path}`,
    data,
    headers: jar ? { Cookie: jar.header() } : {},
    validateStatus: () => true
  });
  if (jar) jar.absorb(res);
  return res;
}

const ping = (jar, linea, lat, lng) => req(jar, 'post', '/api/bondi/ping', { linea, lat, lng, velocidad: 8, rumbo: 90 });
const subir = (jar, linea) => req(jar, 'post', '/api/estado/registrar-usuario', { linea, ramal: 'default', accion: 'subir' });

async function getColectivo(linea) {
  const res = await req(null, 'get', '/api/bondi/');
  const list = res.data?.colectivos || [];
  return list.find(c => String(c.linea) === String(linea) || c.id === String(linea)) || null;
}

let pass = 0, fail = 0;
function assert(cond, nombre, detalle = '') {
  if (cond) { pass++; console.log(`  ✅ ${nombre}`); }
  else { fail++; console.log(`  ❌ ${nombre} ${detalle}`); }
}

async function main() {
  console.log(`\n🎯 Ataque E2E contra ${BASE}\n`);

  // (a) Fantasma anónimo: 1 ping suelto jamás debe quedar verificado
  console.log('(a) Ping único anónimo (fantasma barato)');
  {
    const jar = new Jar();
    const r = await ping(jar, 'QA1', LAT0, LNG0);
    assert(r.status === 200, 'ping aceptado (200)', `status=${r.status}`);
    assert(r.data?.verificado === false, 'NO queda verificado', JSON.stringify(r.data));
    const c = await getColectivo('QA1');
    assert(c && c.esVerificado === false, 'GET: esVerificado false (el front lo pinta TRAIL, nunca verde)');
  }

  // (b) Teleport dentro de la misma sesión
  console.log('(b) Teleport (2 pings a 5 km en 10s)');
  {
    const jar = new Jar();
    await ping(jar, 'QA2', LAT0, LNG0);
    await sleep(10000);
    const r2 = await ping(jar, 'QA2', LAT0 + 0.045, LNG0); // ~5 km
    assert(r2.status === 422, 'segundo ping rechazado con 422', `status=${r2.status}`);
  }

  // (c) Fuera de AMBA
  console.log('(c) Ping fuera de zona (Córdoba)');
  {
    const jar = new Jar();
    const r = await ping(jar, 'QA3', -31.42, -64.18);
    assert(r.status === 422, 'rechazado con 422', `status=${r.status}`);
  }

  // (e) Flujo legítimo / atacante persistente: subir + trayectoria plausible
  console.log('(e) Trayectoria plausible + subir con la MISMA cookie (~50s)');
  {
    const jar = new Jar();
    const rSubir = await subir(jar, 'QA4');
    assert(rSubir.status === 200, 'subir ok', `status=${rSubir.status}`);
    let ultimo = null;
    for (let i = 0; i < 5; i++) {
      ultimo = await ping(jar, 'QA4', LAT0 + PASO * i, LNG0);
      if (i < 4) await sleep(9000);
    }
    assert(ultimo.data?.verificado === true, 'graduado: último ping verificado=true', JSON.stringify(ultimo.data));
    const c = await getColectivo('QA4');
    assert(c && c.esVerificado === true, 'GET: esVerificado true');
    assert(c && c.pasajerosCount === 1, 'GET: pasajerosCount === 1', `count=${c?.pasajerosCount}`);
    assert(c && c.usuariosActivos === undefined, 'GET: usuariosActivos NO se filtra (privacidad)', JSON.stringify(Object.keys(c || {})));
  }

  // (f) Misma trayectoria SIN subir: nunca verificado
  console.log('(f) Trayectoria plausible SIN subir (~50s)');
  {
    const jar = new Jar();
    let ultimo = null;
    for (let i = 0; i < 5; i++) {
      ultimo = await ping(jar, 'QA5', LAT0 + PASO * i, LNG0);
      if (i < 4) await sleep(9000);
    }
    assert(ultimo.data?.verificado === false, 'nunca verificado sin subir', JSON.stringify(ultimo.data));
    const c = await getColectivo('QA5');
    assert(c && c.esVerificado === false, 'GET: esVerificado false');
  }

  // (g) Rotación de cookie a mitad de trayectoria: probation reseteada
  console.log('(g) Rotación de cookie a mitad de camino (~50s)');
  {
    const jarA = new Jar();
    await subir(jarA, 'QA6');
    await ping(jarA, 'QA6', LAT0, LNG0);
    await sleep(9000);
    await ping(jarA, 'QA6', LAT0 + PASO, LNG0);
    await sleep(9000);
    const jarB = new Jar(); // identidad nueva: pierde todo lo acumulado
    const r3 = await ping(jarB, 'QA6', LAT0 + PASO * 2, LNG0);
    await sleep(9000);
    const r4 = await ping(jarB, 'QA6', LAT0 + PASO * 3, LNG0);
    assert(r3.data?.verificado === false && r4.data?.verificado === false,
      'cookie nueva nunca verifica (probation desde cero)', JSON.stringify({ r3: r3.data, r4: r4.data }));
  }

  // (d) Flood — al final porque quema la ventana del limiter (12/min)
  console.log('(d) Flood de pings (15 sin pausa)');
  {
    const jar = new Jar();
    let got429 = false;
    for (let i = 0; i < 15; i++) {
      const r = await ping(jar, 'QA1', LAT0 + PASO * 0.1 * i, LNG0);
      if (r.status === 429) got429 = true;
    }
    assert(got429, 'al menos un 429 del rate limit');
  }

  console.log(`\n${fail === 0 ? '🟢' : '🔴'} Resultado: ${pass} PASS, ${fail} FAIL\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('Error fatal del script:', e.message);
  process.exit(1);
});
