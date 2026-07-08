import { db, admin } from '../firebase.js';

const USERS_COLLECTION = 'usuarios';

class UserService {
    /**
     * Obtener usuario por ID
     * @param {string} userId 
     */
    async getUser(userId) {
        try {
            const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
            if (!doc.exists) return null;
            return doc.data();
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    /**
     * Crear o actualizar usuario
     * @param {string} userId 
     * @param {Object} data 
     */
    async createUser(userId, data) {
        try {
            const now = new Date().toISOString();
            const userData = {
                ...data,
                userId,
                createdAt: data.createdAt || now,
                ultimaActividad: now,
                nivel: data.nivel || 1,
                puntos: data.puntos || 0,
                reportesEnviados: data.reportesEnviados || 0,
                rutinas: data.rutinas || [],
                favoritos: data.favoritos || [],
                historial: data.historial || [],
                garage: data.garage || { colorBondi: '#4F46E5', accesorios: [], logros: [] },
                estadisticas: data.estadisticas || {
                    viajesRealizados: 0,
                    verificacionesRealizadas: 0,
                    tiempoTotalViaje: 0,
                    puntosGanados: 0
                }
            };

            await db.collection(USERS_COLLECTION).doc(userId).set(userData, { merge: true });
            return userData;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Actualizar usuario
     * @param {string} userId 
     * @param {Object} updates 
     */
    async updateUser(userId, updates) {
        try {
            await db.collection(USERS_COLLECTION).doc(userId).update({
                ...updates,
                ultimaActividad: new Date().toISOString()
            });
            return await this.getUser(userId);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Agregar favorito
     */
    async addFavorite(userId, favorite) {
        try {
            await db.collection(USERS_COLLECTION).doc(userId).update({
                favoritos: admin.firestore.FieldValue.arrayUnion({
                    ...favorite,
                    agregado: new Date().toISOString()
                })
            });
            return await this.getUser(userId);
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    }

    /**
     * Eliminar favorito
     * Nota: arrayRemove requiere el objeto EXACTO. Si no es exacto, es mejor leer, filtrar y reescribir.
     * Para simplicidad y robustez, usaremos lectura + filtro + escritura.
     */
    async removeFavorite(userId, linea, ramal) {
        try {
            const user = await this.getUser(userId);
            if (!user) throw new Error('Usuario no encontrado');

            const nuevosFavoritos = user.favoritos.filter(
                f => !(f.linea === linea && f.ramal === (ramal || 'default'))
            );

            await db.collection(USERS_COLLECTION).doc(userId).update({
                favoritos: nuevosFavoritos
            });
            return nuevosFavoritos;
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    }

    /**
     * Agregar rutina
     */
    async addRoutine(userId, routine) {
        try {
            await db.collection(USERS_COLLECTION).doc(userId).update({
                rutinas: admin.firestore.FieldValue.arrayUnion({
                    ...routine,
                    activa: true
                })
            });
            const user = await this.getUser(userId);
            return user.rutinas;
        } catch (error) {
            console.error('Error adding routine:', error);
            throw error;
        }
    }

    /**
     * Agregar visita al historial y actualizar stats
     */
    async addHistory(userId, viaje) {
        try {
            const userRef = db.collection(USERS_COLLECTION).doc(userId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) throw new Error('Usuario no encontrado');
            const userData = userDoc.data();

            const nuevoViaje = {
                ...viaje,
                fecha: new Date().toISOString()
            };

            // Cálculos de stats
            let stats = userData.estadisticas || { viajesRealizados: 0, tiempoTotalViaje: 0, verificacionesRealizadas: 0, puntosGanados: 0 };
            stats.viajesRealizados = (stats.viajesRealizados || 0) + 1;
            if (viaje.duracion) stats.tiempoTotalViaje = (stats.tiempoTotalViaje || 0) + viaje.duracion;

            let puntosExtra = 0;
            if (viaje.verificado) {
                stats.verificacionesRealizadas = (stats.verificacionesRealizadas || 0) + 1;
                puntosExtra = 20;
                stats.puntosGanados = (stats.puntosGanados || 0) + puntosExtra;
            }

            await userRef.update({
                historial: admin.firestore.FieldValue.arrayUnion(nuevoViaje),
                estadisticas: stats,
                'garage.puntos': admin.firestore.FieldValue.increment(puntosExtra)
            });

            // Retornar historial actualizado (leemos de nuevo o lo construimos)
            // Firestore arrayUnion es asíncrono, mejor devolver lo que sabemos o null
            return [...(userData.historial || []), nuevoViaje];
        } catch (error) {
            console.error('Error adding history:', error);
            throw error;
        }
    }

    /**
     * Otorgar puntos server-side (única vía válida de sumar puntos).
     * Crea el perfil on-the-fly si no existe todavía.
     */
    async awardPoints(userId, puntos) {
        if (!puntos || puntos <= 0) return null;
        try {
            const existing = await this.getUser(userId);
            if (!existing) {
                await this.createUser(userId, { nombre: 'Usuario' });
            }
            return await this.updateGarage(userId, { puntos });
        } catch (error) {
            // Los puntos nunca deben romper el flujo principal
            console.error('Error awarding points:', error.message);
            return null;
        }
    }

    /**
     * Actualizar Garage
     */
    async updateGarage(userId, garageUpdate) {
        try {
            const updates = {};
            if (garageUpdate.puntos) {
                updates['garage.puntos'] = admin.firestore.FieldValue.increment(garageUpdate.puntos);
                updates['estadisticas.puntosGanados'] = admin.firestore.FieldValue.increment(garageUpdate.puntos);
            }
            if (garageUpdate.colorBondi) {
                updates['garage.colorBondi'] = garageUpdate.colorBondi;
            }
            if (garageUpdate.accesorio) {
                updates['garage.accesorios'] = admin.firestore.FieldValue.arrayUnion(garageUpdate.accesorio);
            }

            // Check Level Up logic (requires caching or checking current points)
            // For simplicity in this migration, we'll just update points. 
            // A trigger or client-side check can handle level ups, or we read-write.
            // Let's read-write to be safe about levels.
            const userRef = db.collection(USERS_COLLECTION).doc(userId);

            await db.runTransaction(async (t) => {
                const doc = await t.get(userRef);
                if (!doc.exists) throw new Error("User not found");
                const data = doc.data();

                let nuevosPuntos = (data.garage?.puntos || 0);
                if (garageUpdate.puntos) nuevosPuntos += garageUpdate.puntos;

                const nuevoNivel = Math.floor(nuevosPuntos / 100) + 1;
                const nivelActual = data.garage?.nivel || 1;

                const transUpdates = {};
                if (garageUpdate.puntos) {
                    transUpdates['garage.puntos'] = nuevosPuntos;
                    transUpdates['estadisticas.puntosGanados'] = (data.estadisticas?.puntosGanados || 0) + garageUpdate.puntos;
                }
                if (nuevoNivel > nivelActual) {
                    transUpdates['garage.nivel'] = nuevoNivel;
                    const newLogro = {
                        id: `nivel_${nuevoNivel}`,
                        nombre: `Nivel ${nuevoNivel}`,
                        descripcion: `Alcanzaste el nivel ${nuevoNivel}`,
                        fecha: new Date().toISOString()
                    };
                    // Manually handling array union for transaction consistency if needed, 
                    // but arrayUnion works in update.
                    let logros = data.garage?.logros || [];
                    logros.push(newLogro);
                    transUpdates['garage.logros'] = logros;
                }
                if (garageUpdate.colorBondi) {
                    transUpdates['garage.colorBondi'] = garageUpdate.colorBondi;
                }
                if (garageUpdate.accesorio) {
                    // simple check
                    let accesorios = data.garage?.accesorios || [];
                    if (!accesorios.includes(garageUpdate.accesorio)) {
                        accesorios.push(garageUpdate.accesorio);
                        transUpdates['garage.accesorios'] = accesorios;
                    }
                }

                t.update(userRef, transUpdates);
            });

            return await this.getUser(userId);

        } catch (error) {
            console.error('Error updating garage:', error);
            throw error;
        }
    }
}

export default new UserService();
