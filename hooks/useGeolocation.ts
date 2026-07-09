import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { UserRole, UserProfile } from '../types';
import { Geolocation } from '@capacitor/geolocation';
import { colectivosAPI, estadoColectivoAPI } from '../services/api';
import { rotateTripId, registerPanicCallback, calculateDistance } from '../utils/privacy';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface Location {
    lat: number;
    lng: number;
}

interface UseGeolocationParams {
    userId: string;
    profile: UserProfile;
    setProfile: Dispatch<SetStateAction<UserProfile>>;
    addPoints: (amount: number) => Promise<void>;
    verificarDesviacion: (lat: number, lng: number) => boolean;
    showDesviacionAlert: boolean;
    setShowDesviacionAlert: (show: boolean) => void;
    setRutinaUsuario: Dispatch<SetStateAction<Location[]>>;
}

// Intervalo de pings GPS. A 10s, un viajero-hora son ~360 writes de Firestore.
const PING_INTERVAL_MS = 10000;

// Gate de movimiento: recién se comparte con la comunidad cuando hay evidencia
// de estar arriba del bondi, no caminando hacia la parada.
// 2.5 m/s (9 km/h) descarta caminata; sostenido en 2 fixes (~20s) descarta picos de GPS.
const SPEED_THRESHOLD_MS = 2.5;
const SUSTAINED_FIXES = 2;
// Fallback para GPS que no reportan velocidad (coords.speed = null):
// ≥150 m recorridos en ~60s (6 fixes) equivale a un promedio ≥2.5 m/s.
const FALLBACK_DISTANCE_M = 150;
const FALLBACK_WINDOW_FIXES = 6;

export const useGeolocation = ({
    userId,
    profile,
    setProfile,
    addPoints,
    verificarDesviacion,
    showDesviacionAlert,
    setShowDesviacionAlert,
    setRutinaUsuario
}: UseGeolocationParams) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [lineaActual, setLineaActual] = useState<string>('');
    const [ramalActual, setRamalActual] = useState<string>('');
    const [compartiendoUbicacion, setCompartiendoUbicacion] = useState(false);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [hasMoved, setHasMoved] = useState(false);
    const [ubicacionesRecientes, setUbicacionesRecientes] = useState<Location[]>([]);

    const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // Estado del gate de movimiento (refs: el setInterval no ve estado fresco)
    const movingFixesRef = useRef(0);
    const gateFixesRef = useRef<Location[]>([]);
    const stateRef = useRef({
        lineaActual,
        ramalActual,
        userId,
        hasMoved,
        ubicacionesRecientes,
        showDesviacionAlert
    });

    // Mantener la referencia del estado actualizada para los closures de setInterval
    useEffect(() => {
        stateRef.current = {
            lineaActual,
            ramalActual,
            userId,
            hasMoved,
            ubicacionesRecientes,
            showDesviacionAlert
        };
    }, [lineaActual, ramalActual, userId, hasMoved, ubicacionesRecientes, showDesviacionAlert]);

    // Detener compartir ubicación
    const detenerCompartirUbicacion = async () => {
        if (gpsIntervalRef.current) {
            clearInterval(gpsIntervalRef.current);
            gpsIntervalRef.current = null;
        }

        const currentLinea = stateRef.current.lineaActual;
        const currentRamal = stateRef.current.ramalActual;
        const currentUserId = stateRef.current.userId;

        // Registrar que el usuario se bajó
        if (currentLinea) {
            try {
                const resultado = await estadoColectivoAPI.registrarUsuario(
                    currentLinea,
                    currentRamal,
                    currentUserId,
                    'bajar'
                );

                if (resultado && resultado.usuariosActivos === 0) {
                    console.log('👻 Sos el último usuario - el colectivo ahora se muestra en GRIS (estimado)');
                }
            } catch (error) {
                console.error('Error registrando bajada en backend:', error);
            }
        }

        setCompartiendoUbicacion(false);
        setLineaActual('');
        setRamalActual('');
        setUbicacionesRecientes([]);
        setUserLocation(null);
        setHasMoved(false);
        movingFixesRef.current = 0;
        gateFixesRef.current = [];

        // Rotar ID de viaje al terminar por privacidad
        rotateTripId();

        console.log('🛑 Dejaste de compartir ubicación');
    };

    // Iniciar compartir ubicación GPS
    const iniciarCompartirUbicacion = async (linea: string, ramal: string) => {
        setLineaActual(linea);
        setRamalActual(ramal);
        setCompartiendoUbicacion(true);

        // Registrar usuario en el backend (el server otorga +5 la primera vez que sube)
        try {
            const resultado = await estadoColectivoAPI.registrarUsuario(linea, ramal, userId, 'subir');
            if (resultado?.puntos > 0) {
                await addPoints(resultado.puntos);
            }
        } catch (error) {
            console.error('Error inicializando compartir ubicación en backend:', error);
        }

        // Función para obtener y enviar ubicación GPS
        const enviarUbicacion = async () => {
            try {
                // Solicitar permisos explícitos (Capacitor Flow)
                const permissions = await Geolocation.checkPermissions();
                if (permissions.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') {
                        showToast(t('geo_permission_denied'), 'error');
                        await detenerCompartirUbicacion();
                        setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
                        return;
                    }
                }

                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000
                });

                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                // Gate de movimiento sostenido: confirma que el usuario está arriba
                // del bondi antes de publicar su posición a la comunidad.
                // OJO: es un latch de ida — una vez activado NO se vuelve a evaluar,
                // así las frenadas (semáforos, paradas) nunca cortan el compartir.
                const speed = position.coords.speed || 0;
                let activeHasMoved = stateRef.current.hasMoved;
                if (!activeHasMoved) {
                    // Camino principal: velocidad del GPS sostenida por encima del umbral
                    if (speed > SPEED_THRESHOLD_MS) {
                        movingFixesRef.current += 1;
                    } else {
                        movingFixesRef.current = 0;
                    }

                    // Fallback: desplazamiento acumulado, para GPS sin coords.speed
                    gateFixesRef.current = [...gateFixesRef.current.slice(-(FALLBACK_WINDOW_FIXES)), { lat: latitude, lng: longitude }];
                    let sustainedByDistance = false;
                    if (gateFixesRef.current.length > FALLBACK_WINDOW_FIXES) {
                        const oldest = gateFixesRef.current[0];
                        const recorrido = calculateDistance(oldest.lat, oldest.lng, latitude, longitude);
                        sustainedByDistance = recorrido >= FALLBACK_DISTANCE_M;
                    }

                    if (movingFixesRef.current >= SUSTAINED_FIXES || sustainedByDistance) {
                        console.log('🚀 Movimiento sostenido detectado! Iniciando sincronización comunitaria.');
                        setHasMoved(true);
                        activeHasMoved = true;
                    }
                }

                // Agregar a ubicaciones recientes
                setUbicacionesRecientes(prev => [...prev.slice(-10), { lat: latitude, lng: longitude }]);

                // Verificar desviación contra la rutina real del usuario (si definió una).
                // Sin rutina cargada, verificarDesviacion devuelve false y no molesta.
                const hayDesviacion = verificarDesviacion(latitude, longitude);
                if (hayDesviacion && !stateRef.current.showDesviacionAlert) {
                    setShowDesviacionAlert(true);
                }

                // Enviar ping al backend solo si se confirmó movimiento
                if (activeHasMoved) {
                    await colectivosAPI.enviarPing({
                        linea: linea,
                        ramal: ramal,
                        lat: latitude,
                        lng: longitude,
                        velocidad: Math.round(position.coords.speed || 0),
                        rumbo: Math.round(position.coords.heading || 0)
                    });
                } else {
                    console.log('⏳ Esperando movimiento para compartir con la comunidad...');
                }

                console.log(`📍 GPS compartido (Capacitor): ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } catch (error) {
                console.error('Error obteniendo ubicación Capacitor:', error);
                showToast(t('geo_error'), 'error');
                await detenerCompartirUbicacion();
                setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
            }
        };

        // Enviar ubicación inmediatamente
        await enviarUbicacion();

        // Configurar intervalo de pings
        if (gpsIntervalRef.current) {
            clearInterval(gpsIntervalRef.current);
        }
        gpsIntervalRef.current = setInterval(enviarUbicacion, PING_INTERVAL_MS);
    };

    // Registrar callback de pánico
    useEffect(() => {
        registerPanicCallback(async () => {
            await detenerCompartirUbicacion();
            setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
            showToast(t('panic_activated'), 'error');
        });

        return () => {
            if (gpsIntervalRef.current) {
                clearInterval(gpsIntervalRef.current);
            }
        };
    }, []);

    return {
        lineaActual,
        ramalActual,
        compartiendoUbicacion,
        userLocation,
        hasMoved,
        ubicacionesRecientes,
        iniciarCompartirUbicacion,
        detenerCompartirUbicacion
    };
};
