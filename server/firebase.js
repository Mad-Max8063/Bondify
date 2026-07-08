import firebaseAdmin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let db;
let admin;
let isMock = false;

// Intentamos cargar la llave. Si no existe o es falsa, usamos Mock.
// Intentamos cargar la llave.
// Prioridad 1: Variable de Entorno (Producción/Emergent)
// Prioridad 2: Archivo local (Desarrollo)
try {
    let serviceAccount;

    if (process.env.FIREBASE_CREDENTIALS) {
        // En Emergent, pegamos el JSON entero en esta variable
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
            console.log("🔑 Usando credenciales desde Variable de Entorno");
        } catch (e) {
            console.error("Error parseando FIREBASE_CREDENTIALS JSON", e);
        }
    }

    if (!serviceAccount) {
        // Fallback a archivo local
        try {
            serviceAccount = require('./serviceAccountKey.json');
            console.log("📂 Usando credenciales desde archivo local");
        } catch (e) {
            // No existe el archivo, seguimos al catch del bloque principal
            throw new Error("No credentials found");
        }
    }

    if (serviceAccount.project_id === "placeholder-project") {
        throw new Error("Using placeholder key");
    }

    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount)
    });
    admin = firebaseAdmin;
    db = admin.firestore();
    console.log("🔥 Firebase conectado con éxito.");
} catch (e) {
    // En producción una DB en memoria que se borra en cada restart es un desastre
    // silencioso: preferimos que el deploy falle a la vista.
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_DB !== 'true') {
        console.error("FATAL: sin credenciales de Firebase en producción (FIREBASE_CREDENTIALS o serviceAccountKey.json). Abortando.");
        process.exit(1);
    }
    console.warn("⚠️  NO se encontró 'serviceAccountKey.json' real. Iniciando en MOCK MODE (Memoria Local).");
    isMock = true;

    // --- MOCK FIRESTORE IMPLEMENTATION ---
    // Simula una DB en memoria muy básica para que no explote el backend.
    const memoryDB = {};

    class MockDoc {
        constructor(path, data = {}) { this.path = path; this.dataVal = data; }
        async set(data, options) {
            if (options && options.merge) {
                this.dataVal = { ...this.dataVal, ...data };
            } else {
                this.dataVal = data;
            }
            memoryDB[this.path] = this.dataVal;
            return { isActive: true };
        }
        async update(data) {
            // Soporta field paths con punto ("garage.puntos") como Firestore real
            const setDeep = (obj, dottedKey, applyFn) => {
                const parts = dottedKey.split('.');
                let target = obj;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (typeof target[parts[i]] !== 'object' || target[parts[i]] === null) target[parts[i]] = {};
                    target = target[parts[i]];
                }
                const leaf = parts[parts.length - 1];
                target[leaf] = applyFn(target[leaf]);
            };

            for (const key in data) {
                if (data[key] && data[key]._methodName === 'arrayUnion') {
                    setDeep(this.dataVal, key, (curr) => {
                        const arr = Array.isArray(curr) ? curr : [];
                        arr.push(...data[key]._elements);
                        return arr;
                    });
                } else if (data[key] && data[key]._methodName === 'increment') {
                    setDeep(this.dataVal, key, (curr) => (curr || 0) + data[key].value);
                } else {
                    setDeep(this.dataVal, key, () => data[key]);
                }
            }
            memoryDB[this.path] = this.dataVal;
            return { isActive: true };
        }
        async get() { return { exists: !!memoryDB[this.path], data: () => memoryDB[this.path] || {}, id: this.path.split('/').pop() }; }
        async delete() { delete memoryDB[this.path]; return { isActive: true }; }
    }

    class MockCollection {
        constructor(name) { this.name = name; }
        doc(id) {
            const path = `${this.name}/${id}`;
            const existingData = memoryDB[path];
            return new MockDoc(path, existingData);
        }
        async add(data) {
            const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const path = `${this.name}/${id}`;
            memoryDB[path] = data;
            return { id, path };
        }
        where() { return this; } // Ignoramos filtros en mock
        orderBy() { return this; }
        limit() { return this; }
        async get() {
            // Devolver todos los docs de la colección
            const docs = Object.keys(memoryDB)
                .filter(k => k.startsWith(this.name + '/'))
                .map(k => ({
                    id: k.split('/').pop(),
                    data: () => memoryDB[k],
                    ref: new MockDoc(k, memoryDB[k])
                }));
            return { forEach: (cb) => docs.forEach(cb), empty: docs.length === 0, docs: docs, size: docs.length };
        }
    }

    db = {
        collection: (name) => new MockCollection(name),
        runTransaction: async (cb) => {
            // Mock transaction: just run the callback with a fake transaction object that maps to direct calls
            const t = {
                get: (ref) => ref.get(),
                update: (ref, data) => ref.update(data),
                set: (ref, data) => ref.set(data),
                delete: (ref) => ref.delete()
            };
            return cb(t);
        }
    };

    // Mock de Admin features
    admin = {
        firestore: {
            FieldValue: {
                serverTimestamp: () => new Date().toISOString(),
                arrayUnion: (...elements) => ({ _methodName: 'arrayUnion', _elements: elements }),
                increment: (n) => ({ _methodName: 'increment', value: n })
            }
        }
    };

    // --- CLEANUP TAREAS (PRIVACIDAD) ---
    // En el modo Mock, borramos físicamente los datos viejos cada minuto
    setInterval(() => {
        const now = Date.now();
        const EXPIRATION = 5 * 60 * 1000; // 5 minutos

        Object.keys(memoryDB).forEach(path => {
            const data = memoryDB[path];
            if (data.ultimaActualizacion) {
                const updated = new Date(data.ultimaActualizacion).getTime();
                if (now - updated > EXPIRATION) {
                    delete memoryDB[path];
                    console.log(`[Privacy Mock] Dato expirado y borrado: ${path}`);
                }
            }
        });
    }, 60 * 1000);
}

export { db, admin, isMock };
