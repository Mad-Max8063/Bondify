import { useState, useEffect, useRef } from 'react';
import { UserRole, UserProfile } from '../types';
import { Geolocation } from '@capacitor/geolocation';
import { usuariosAPI, colectivosAPI, estadoColectivoAPI } from '../services/api';
import { rotateTripId, registerPanicCallback, isNearDestination } from '../utils/privacy';

interface Location {
    lat: number;
    lng: number;
}

interface UseGeolocationParams {
    userId: string;
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    addPoints: (amount: number) => Promise<void>;
    verificarDesviacion: (lat: number, lng: number) => boolean;
    showDesviacionAlert: boolean;
    setShowDesviacionAlert: (show: boolean) => void;
    setRutinaUsuario: React.Dispatch<React.SetStateAction<Location[]>>;
}

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

        // Registrar usuario en el backend
        try {
            await estadoColectivoAPI.registrarUsuario(linea, ramal, userId, 'subir');

            // Cargar rutina del usuario si existe
            const usuario = await usuariosAPI.obtenerPerfil(userId);
            if (usuario && usuario.rutinas && usuario.rutinas.length > 0) {
                setRutinaUsuario([
                    { lat: -34.5828, lng: -58.4215 }, // Plaza Italia
                    { lat: -34.5650, lng: -58.4400 }, // Belgrano
                    { lat: -34.5500, lng: -58.4500 }  // Olivos
                ]);
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
                        alert('No se pudo obtener tu ubicación. Por favor, habilitá los permisos de GPS en los ajustes de tu celular.');
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
                let nuevasUbicaciones: Location[] = [];
                setUbicacionesRecientes(prev => {
                    nuevasUbicaciones = [...prev.slice(-10), { lat: latitude, lng: longitude }];
                    return nuevasUbicaciones;
                });

                // Verificar desviación después de tener al menos 3 ubicaciones
                if (nuevasUbicaciones.length >= 3 || stateRef.current.ubicacionesRecientes.length >= 2) {
                    const checkLocations = nuevasUbicaciones.length >= 3 ? nuevasUbicaciones : [...stateRef.current.ubicacionesRecientes, { lat: latitude, lng: longitude }];
                    const hayDesviacion = verificarDesviacion(latitude, longitude);
                    if (hayDesviacion && !stateRef.current.showDesviacionAlert) {
                        setShowDesviacionAlert(true);
                    }
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

                // Protección de destino: Si estamos cerca del destino (simulado), detener GPS
                const destinoDemo = { lat: -34.5500, lng: -58.4500 };
                if (isNearDestination(latitude, longitude, destinoDemo.lat, destinoDemo.lng)) {
                    console.log('🏁 Cerca del destino: Deteniendo GPS por privacidad');
                    await detenerCompartirUbicacion();
                    setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
                    alert('🏁 Estás llegando a tu destino. Detuvimos el GPS automáticamente por tu privacidad.');
                }

                console.log(`📍 GPS compartido (Capacitor): ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } catch (error) {
                console.error('Error obteniendo ubicación Capacitor:', error);
                alert('Error de GPS: Asegurate de tener la ubicación activada en tu celular.');
                await detenerCompartirUbicacion();
                setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
            }
        };

        // Enviar ubicación inmediatamente
        await enviarUbicacion();

        // Configurar intervalo para enviar cada 5 segundos
        if (gpsIntervalRef.current) {
            clearInterval(gpsIntervalRef.current);
        }
        gpsIntervalRef.current = setInterval(enviarUbicacion, 5000);

        // Sumar puntos por activar GPS
        await addPoints(5);
    };

    // Registrar callback de pánico
    useEffect(() => {
        registerPanicCallback(async () => {
            await detenerCompartirUbicacion();
            setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
            alert('🚨 MODO PÁNICO: GPS apagado y datos de sesión borrados por tu seguridad.');
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
