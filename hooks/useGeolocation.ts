import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { UserRole, UserProfile } from '../types';
import { Geolocation } from '@capacitor/geolocation';
import { colectivosAPI, estadoColectivoAPI } from '../services/api';
import { rotateTripId, registerPanicCallback } from '../utils/privacy';
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

                // Detectar movimiento (más de 5km/h = 1.4m/s) para confirmar que ya está viajando
                const speed = position.coords.speed || 0;
                let activeHasMoved = stateRef.current.hasMoved;
                if (!activeHasMoved && speed > 1.4) {
                    console.log('🚀 Movimiento detectado! Iniciando sincronización comunitaria.');
                    setHasMoved(true);
                    activeHasMoved = true;
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
