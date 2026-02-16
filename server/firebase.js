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
            // Very basic support for arrayUnion mock
            for (const key in data) {
                if (data[key] && data[key]._methodName === 'arrayUnion') {
                    if (!Array.isArray(this.dataVal[key])) this.dataVal[key] = [];
                    this.dataVal[key].push(...data[key]._elements);
                } else if (data[key] && data[key]._methodName === 'increment') {
                    this.dataVal[key] = (this.dataVal[key] || 0) + data[key].value;
                } else {
                    this.dataVal[key] = data[key];
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
        where() { return this; } // Ignoramos filtros en mock
        async get() {
            // Devolver todos los docs de la colección
            const docs = Object.keys(memoryDB)
                .filter(k => k.startsWith(this.name + '/'))
                .map(k => ({
                    id: k.split('/').pop(),
                    data: () => memoryDB[k]
                }));
            return { forEach: (cb) => docs.forEach(cb), empty: docs.length === 0, docs: docs };
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
