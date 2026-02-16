/**
 * (c) 2026 Bondify. All rights reserved.
 * Proprietary and Confidential.
 */
import React, { useState, useEffect } from 'react';
import { UserMode, UserRole, UserProfile, GarageState, Routine, DemoAction } from './types';
import { INITIAL_GARAGE } from './constants';
import { Onboarding } from './components/Onboarding';
import { MapInterface } from './components/MapInterface';
import { Garage } from './components/Garage';
import { ProfileSettings } from './components/ProfileSettings';
import { SmartNudge } from './components/SmartNudge';
import { DemoControls } from './components/DemoControls';
import { Favoritos } from './components/Favoritos';
import { Historial } from './components/Historial';
import { WazeReportButton } from './components/WazeReportButton';
import { ActivarViajeroModal } from './components/ActivarViajeroModal';
import { CompartiendoUbicacion } from './components/CompartiendoUbicacion';
import { DesviacionAlert } from './components/DesviacionAlert';
import { ConfirmarDesvioAlert } from './components/ConfirmarDesvioAlert';
import { DesvioNotificacion } from './components/DesvioNotificacion';
import { InstallGuide } from './components/InstallGuide';
import { Map, Trophy, Power, User, Star, Clock } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { usuariosAPI, colectivosAPI, estadoColectivoAPI, reportesAPI, checkBackendHealth } from './services/api';
import {
    getTripId,
    rotateTripId,
    registerPanicCallback,
    activatePanicMode,
    deleteAllUserData,
    isNearDestination
} from './utils/privacy';

// Generar o recuperar userId único
const getUserId = () => {
    let userId = localStorage.getItem('miparada_userId');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('miparada_userId', userId);
    }
    return userId;
};

const App: React.FC = () => {
    const [userId] = useState(getUserId());
    const [profile, setProfile] = useState<UserProfile>({
        mode: UserMode.EFFICIENT,
        role: UserRole.WAITER,
        garage: INITIAL_GARAGE,
        hasOnboarded: false,
        isPresentationMode: false
    });

    const [isGarageOpen, setIsGarageOpen] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [showFavoritos, setShowFavoritos] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showTravelerNudge, setShowTravelerNudge] = useState(false);
    const [nudgeRoutine, setNudgeRoutine] = useState<Routine | null>(null);
    const [demoAction, setDemoAction] = useState<DemoAction | null>(null);

    // Estado para compartir ubicación GPS
    const [showActivarViajero, setShowActivarViajero] = useState(false);
    const [compartiendoUbicacion, setCompartiendoUbicacion] = useState(false);
    const [lineaActual, setLineaActual] = useState<string>('');
    const [ramalActual, setRamalActual] = useState<string>('');
    const [gpsInterval, setGpsInterval] = useState<NodeJS.Timeout | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hasMoved, setHasMoved] = useState(false);

    // Estado para detección de desviación
    const [showDesviacionAlert, setShowDesviacionAlert] = useState(false);
    const [ubicacionesRecientes, setUbicacionesRecientes] = useState<{ lat: number, lng: number }[]>([]);
    const [rutinaUsuario, setRutinaUsuario] = useState<{ lat: number, lng: number }[]>([]);

    // Estado para confirmación de desvío de otros usuarios
    const [reportePendiente, setReportePendiente] = useState<any>(null);
    const [showConfirmarDesvio, setShowConfirmarDesvio] = useState(false);
    const [reportesYaVistos, setReportesYaVistos] = useState<string[]>([]);

    // Estado para notificaciones de desvío confirmado
    const [desvioConfirmado, setDesvioConfirmado] = useState<{ linea: string, ramal?: string } | null>(null);

    // Estado para mostrar guía de instalación PWA
    const [showInstallGuide, setShowInstallGuide] = useState(false);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    // Sincronizar perfil con backend al completar onboarding
    useEffect(() => {
        if (profile.hasOnboarded && userId) {
            usuariosAPI.obtenerPerfil(userId, 'Usuario', profile.mode);
        }
    }, [profile.hasOnboarded, profile.mode, userId]);

    // Mostrar banner de instalación PWA si no está instalada
    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const bannerDismissed = localStorage.getItem('bondify_install_dismissed');

        if (!isStandalone && !bannerDismissed && profile.hasOnboarded) {
            // Mostrar banner después de 30 segundos de uso
            const timer = setTimeout(() => {
                setShowInstallBanner(true);
            }, 30000);
            return () => clearTimeout(timer);
        }
    }, [profile.hasOnboarded]);

    const handleOnboardingComplete = (mode: UserMode) => {
        setProfile(prev => ({
            ...prev,
            mode,
            hasOnboarded: true
        }));
    };

    const handleModeChange = (mode: UserMode) => {
        setProfile(prev => ({
            ...prev,
            mode
        }));
        // If switching to efficient, ensure gamification UI is closed
        if (mode === UserMode.EFFICIENT) {
            setIsGarageOpen(false);
        }
    };

    const handleTogglePresentationMode = () => {
        setProfile(prev => ({ ...prev, isPresentationMode: !prev.isPresentationMode }));
    };

    const handleDemoNudge = () => {
        setNudgeRoutine({
            id: 'demo-nudge',
            line: '60',
            time: 'AHORA',
            active: true
        });
    };

    const handleDemoChaos = () => {
        setDemoAction({ type: 'CHAOS', id: Date.now() });
    };

    const handleDemoGhostBus = () => {
        setDemoAction({ type: 'GHOST', id: Date.now() });
    };

    const toggleRole = () => {
        const nuevoRole = profile.role === UserRole.WAITER ? UserRole.TRAVELER : UserRole.WAITER;

        if (nuevoRole === UserRole.TRAVELER) {
            // Activar modo viajero - mostrar modal para seleccionar línea
            setShowActivarViajero(true);
        } else {
            // Desactivar modo viajero
            detenerCompartirUbicacion();
            // Rotar ID de viaje por privacidad al terminar viaje
            rotateTripId();
        }

        setProfile(prev => ({
            ...prev,
            role: nuevoRole
        }));
    };

    // Registrar callback de pánico
    useEffect(() => {
        registerPanicCallback(() => {
            detenerCompartirUbicacion();
            setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
            alert('🚨 MODO PÁNICO: GPS apagado y datos de sesión borrados por tu seguridad.');
        });
    }, []);

    // Función para calcular distancia entre dos puntos (en metros)
    const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371e3; // Radio de la Tierra en metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distancia en metros
    };

    // Verificar si hay desviación de la ruta
    const verificarDesviacion = (lat: number, lng: number) => {
        // Si no hay rutina cargada, no hay desviación
        if (rutinaUsuario.length === 0) return false;

        // Calcular distancia mínima a cualquier punto de la rutina
        const distanciaMinima = Math.min(
            ...rutinaUsuario.map(punto =>
                calcularDistancia(lat, lng, punto.lat, punto.lng)
            )
        );

        // Si está a más de 500 metros de la ruta habitual, es desviación
        return distanciaMinima > 500;
    };

    // Iniciar compartir ubicación GPS
    const iniciarCompartirUbicacion = async (linea: string, ramal: string) => {
        setLineaActual(linea);
        setRamalActual(ramal);
        setCompartiendoUbicacion(true);
        setShowActivarViajero(false);

        // Registrar usuario en el backend
        await estadoColectivoAPI.registrarUsuario(linea, ramal, userId, 'subir');

        // Cargar rutina del usuario si existe
        const usuario = await usuariosAPI.obtenerPerfil(userId);
        if (usuario && usuario.rutinas && usuario.rutinas.length > 0) {
            // Por ahora simulamos algunas ubicaciones de rutina
            // En producción esto vendría del historial real del usuario
            setRutinaUsuario([
                { lat: -34.5828, lng: -58.4215 }, // Plaza Italia
                { lat: -34.5650, lng: -58.4400 }, // Belgrano
                { lat: -34.5500, lng: -58.4500 }  // Olivos
            ]);
        }

        // Función para enviar ubicación GPS
        const enviarUbicacion = async () => {
            try {
                // Solicitar permisos explícitos (Capacitor Flow)
                const permissions = await Geolocation.checkPermissions();
                if (permissions.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') {
                        alert('No se pudo obtener tu ubicación. Por favor, habilitá los permisos de GPS en los ajustes de tu celular.');
                        detenerCompartirUbicacion();
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
                if (!hasMoved && speed > 1.4) {
                    console.log('🚀 Movimiento detectado! Iniciando sincronización comunitaria.');
                    setHasMoved(true);
                }

                // Agregar a ubicaciones recientes
                setUbicacionesRecientes(prev => [...prev.slice(-10), { lat: latitude, lng: longitude }]);

                // Verificar desviación después de tener al menos 3 ubicaciones
                if (ubicacionesRecientes.length >= 3) {
                    const hayDesviacion = verificarDesviacion(latitude, longitude);
                    if (hayDesviacion && !showDesviacionAlert) {
                        setShowDesviacionAlert(true);
                    }
                }

                // Enviar ping al backend solo si se confirmó movimiento
                if (hasMoved) {
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
                    detenerCompartirUbicacion();
                    setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
                    alert('🏁 Estás llegando a tu destino. Detuvimos el GPS automáticamente por tu privacidad.');
                }

                console.log(`📍 GPS compartido (Capacitor): ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } catch (error) {
                console.error('Error obteniendo ubicación Capacitor:', error);
                // Si falla el plugin, avisar al usuario
                alert('Error de GPS: Asegurate de tener la ubicación activada en tu celular.');
                detenerCompartirUbicacion();
                setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
            }
        };

        // Enviar ubicación inmediatamente
        enviarUbicacion();

        // Configurar intervalo para enviar cada 5 segundos
        const interval = setInterval(enviarUbicacion, 5000);
        setGpsInterval(interval);

        // Sumar puntos por activar GPS
        addPoints(5);
    };

    // Detener compartir ubicación
    const detenerCompartirUbicacion = async () => {
        if (gpsInterval) {
            clearInterval(gpsInterval);
            setGpsInterval(null);
        }

        // Registrar que el usuario se bajó
        if (lineaActual) {
            const resultado = await estadoColectivoAPI.registrarUsuario(
                lineaActual,
                ramalActual,
                userId,
                'bajar'
            );

            if (resultado && resultado.usuariosActivos === 0) {
                console.log('👻 Sos el último usuario - el colectivo ahora se muestra en GRIS (estimado)');
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

    // Handlers para el alert de desviación
    const handleConfirmarBajada = async () => {
        setShowDesviacionAlert(false);
        await detenerCompartirUbicacion();
        setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
        alert('✅ Gracias por avisar. El colectivo se mostrará en gris (estimado) para otros usuarios.');
    };

    const handleConfirmarDesvio = async () => {
        setShowDesviacionAlert(false);

        // Crear reporte de desvío que requiere 3 confirmaciones
        try {
            const resultado = await reportesAPI.crear({
                userId: userId,
                tipo: 'desvio',
                linea: lineaActual,
                ramal: ramalActual,
                lat: ubicacionesRecientes[ubicacionesRecientes.length - 1]?.lat || -34.58,
                lng: ubicacionesRecientes[ubicacionesRecientes.length - 1]?.lng || -58.42,
                comentario: `Desvío detectado automáticamente en la línea ${lineaActual}`
            });

            if (resultado?.status === 'ok') {
                addPoints(10);
                alert('⏳ ¡Reporte de desvío enviado!\n\n🔒 Por seguridad, otros pasajeros deberán confirmar el desvío.\n\nCuando 3 pasajeros lo confirmen, se notificará a los usuarios que esperan adelante.\n\n+10 puntos');
            }
        } catch (error) {
            console.error('Error creando reporte de desvío:', error);
            // Fallback al método anterior
            await colectivosAPI.enviarReporte({
                texto: `Desvío en la línea ${lineaActual}`,
                linea: lineaActual,
                lat: ubicacionesRecientes[ubicacionesRecientes.length - 1]?.lat || -34.58,
                lng: ubicacionesRecientes[ubicacionesRecientes.length - 1]?.lng || -58.42
            });
            addPoints(10);
            alert('✅ Reporte de desvío enviado. +10 puntos');
        }
    };

    const handleSeguirViajando = () => {
        setShowDesviacionAlert(false);
        // Actualizar la rutina del usuario con las nuevas ubicaciones
        setRutinaUsuario(prev => [...prev, ...ubicacionesRecientes.slice(-3)]);
        alert('✅ Tu ruta habitual se actualizó.');
    };

    // Limpiar intervalo al desmontar
    useEffect(() => {
        return () => {
            if (gpsInterval) {
                clearInterval(gpsInterval);
            }
        };
    }, [gpsInterval]);

    // Verificar reportes pendientes de confirmación cuando estamos viajando
    useEffect(() => {
        if (!compartiendoUbicacion || !lineaActual) return;

        const verificarReportesPendientes = async () => {
            try {
                const pendientes = await reportesAPI.pendientes(lineaActual, userId);

                if (pendientes.length > 0) {
                    // Filtrar reportes que ya vimos
                    const reportesNuevos = pendientes.filter(r => !reportesYaVistos.includes(r.id));

                    if (reportesNuevos.length > 0 && !showConfirmarDesvio && !showDesviacionAlert) {
                        // Mostrar el primer reporte pendiente
                        setReportePendiente(reportesNuevos[0]);
                        setShowConfirmarDesvio(true);
                    }
                }
            } catch (error) {
                console.error('Error verificando reportes pendientes:', error);
            }
        };

        // Verificar inmediatamente y luego cada 15 segundos
        verificarReportesPendientes();
        const interval = setInterval(verificarReportesPendientes, 15000);

        return () => clearInterval(interval);
    }, [compartiendoUbicacion, lineaActual, userId, reportesYaVistos, showConfirmarDesvio, showDesviacionAlert]);

    // Handlers para confirmar desvío de otro usuario
    const handleConfirmarDesvioOtro = async () => {
        if (!reportePendiente) return;

        setShowConfirmarDesvio(false);
        setReportesYaVistos(prev => [...prev, reportePendiente.id]);

        // Verificar si ahora está confirmado (3 confirmaciones)
        const resultado = await reportesAPI.confirmar(reportePendiente.id, userId);

        if (resultado?.estadoConfirmacion === 'confirmado') {
            // El reporte alcanzó las 3 confirmaciones
            alert('✅ ¡Desvío confirmado por la comunidad!\n\nLos usuarios que esperan adelante serán notificados.');
            addPoints(5);
        } else {
            alert(`✅ Confirmación registrada.\n\nFaltan ${resultado?.faltanConfirmaciones || 0} confirmaciones más. +2 puntos`);
            addPoints(2);
        }

        setReportePendiente(null);
    };

    const handleRechazarDesvio = () => {
        if (reportePendiente) {
            setReportesYaVistos(prev => [...prev, reportePendiente.id]);
        }
        setShowConfirmarDesvio(false);
        setReportePendiente(null);
    };

    // Estado para trackear líneas favoritas (para notificar desvíos)
    const [lineasFavoritas, setLineasFavoritas] = useState<string[]>(['152', '60', '39']);
    const [desviosNotificados, setDesviosNotificados] = useState<string[]>([]);

    // Verificar desvíos confirmados para usuarios que esperan
    useEffect(() => {
        // Solo verificar si NO estamos viajando (somos usuarios esperando)
        if (compartiendoUbicacion) return;

        const verificarDesviosConfirmados = async () => {
            try {
                // Verificar desvíos en líneas favoritas
                for (const linea of lineasFavoritas) {
                    const desvios = await reportesAPI.desviosConfirmados(linea);

                    if (desvios.length > 0) {
                        // Filtrar desvíos que no hemos notificado aún
                        const nuevosDesvios = desvios.filter(d => !desviosNotificados.includes(d.id));

                        if (nuevosDesvios.length > 0) {
                            const desvio = nuevosDesvios[0];
                            setDesvioConfirmado({
                                linea: desvio.linea,
                                ramal: desvio.ramal
                            });
                            setDesviosNotificados(prev => [...prev, desvio.id]);
                            break; // Solo mostrar un desvío a la vez
                        }
                    }
                }
            } catch (error) {
                console.error('Error verificando desvíos confirmados:', error);
            }
        };

        // Verificar cada 30 segundos
        const interval = setInterval(verificarDesviosConfirmados, 30000);
        // También verificar al montar
        verificarDesviosConfirmados();

        return () => clearInterval(interval);
    }, [compartiendoUbicacion, lineasFavoritas, desviosNotificados]);

    const updateBusColor = (color: string) => {
        setProfile(prev => ({
            ...prev,
            garage: { ...prev.garage, busColor: color }
        }));
    };

    const addPoints = async (amount: number) => {
        if (profile.mode === UserMode.COMMUNITY) {
            setProfile(prev => ({
                ...prev,
                garage: { ...prev.garage, points: prev.garage.points + amount }
            }));

            // Sincronizar con backend
            if (userId) {
                await usuariosAPI.actualizarGarage(userId, { puntos: amount });
            }
        }
    };

    // Smart Routine Polling
    useEffect(() => {
        const checkRoutines = () => {
            if (!profile.routines) return;

            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            const currentTime = `${currentHour}:${currentMinute}`;

            const matched = profile.routines.find(r =>
                r.active && !profile.hasOnboarded &&
                (r.time === currentTime || r.returnTime === currentTime)
            );

            // Only nudge if we aren't already in the role or recently notified (simple logic for MVP)
            if (matched && profile.role !== UserRole.WAITER && !nudgeRoutine) {
                setNudgeRoutine(matched);
            }
        };

        const timer = setInterval(checkRoutines, 10000); // Check every 10s
        return () => clearInterval(timer);
    }, [profile.routines, profile.role, nudgeRoutine]);

    const handleRoutineConfirm = () => {
        setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
        setNudgeRoutine(null);
    };

    const handleUpdateRoutines = (routines: Routine[]) => {
        setProfile(prev => ({ ...prev, routines }));
    };

    if (!profile.hasOnboarded) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="h-dynamic w-full flex flex-col bg-slate-100 text-slate-900 font-sans overflow-hidden">

            {/* Smart Nudge Popup */}
            {nudgeRoutine && (
                <SmartNudge
                    line={nudgeRoutine.line}
                    onConfirm={handleRoutineConfirm}
                    onDeny={() => setNudgeRoutine(null)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 relative">
                <MapInterface
                    userRole={profile.role}
                    onAddPoints={addPoints}
                    demoAction={demoAction}
                    userLocation={userLocation}
                />



                {profile.isPresentationMode && (
                    <DemoControls
                        onTriggerNudge={handleDemoNudge}
                        onTriggerChaos={handleDemoChaos}
                        onAddGhostBus={handleDemoGhostBus}
                    />
                )}
            </div>

            {/* Traveler Nudge Modal (Mock) */}
            {showTravelerNudge && (
                <div className="fixed top-4 left-4 right-4 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top duration-500">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">👋</span>
                        <div className="flex-1">
                            <h4 className="font-bold">¡Parece que ya subiste!</h4>
                            <p className="text-sm text-slate-300 mt-1">¿Ayudamos a los demás compartiendo tu viaje de forma anónima?</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => {
                                setShowTravelerNudge(false);
                                addPoints(20);
                                // Add verification logic
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm"
                        >
                            SÍ, VERIFICAR ✅
                        </button>
                        <button
                            onClick={() => setShowTravelerNudge(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium"
                        >
                            Ahora no
                        </button>
                    </div>
                </div>
            )}

            {/* Modal para activar modo viajero */}
            {showActivarViajero && (
                <ActivarViajeroModal
                    onActivar={iniciarCompartirUbicacion}
                    onCancelar={() => setShowActivarViajero(false)}
                    routines={profile.routines}
                />
            )}

            {/* Indicador de compartiendo ubicación */}
            {compartiendoUbicacion && (
                <CompartiendoUbicacion
                    linea={lineaActual}
                    ramal={ramalActual}
                    onDetener={detenerCompartirUbicacion}
                    usuariosViendote={0} // No se usa más el número exacto
                    onPanic={activatePanicMode}
                />
            )}

            {/* Botón de Reporte estilo Waze - se coloca aquí para tener mayor z-index */}
            <WazeReportButton onReportCreated={() => addPoints(10)} />

            {/* Alert de desviación de ruta */}
            {showDesviacionAlert && (
                <DesviacionAlert
                    linea={lineaActual}
                    ramal={ramalActual}
                    onConfirmarBajada={handleConfirmarBajada}
                    onConfirmarDesvio={handleConfirmarDesvio}
                    onSeguirViajando={handleSeguirViajando}
                />
            )}

            {/* Modal para confirmar desvío reportado por otro usuario */}
            {showConfirmarDesvio && reportePendiente && (
                <ConfirmarDesvioAlert
                    reporteId={reportePendiente.id}
                    linea={reportePendiente.linea}
                    ramal={reportePendiente.ramal}
                    userId={userId}
                    confirmacionesActuales={reportePendiente.confirmacionesActuales}
                    confirmacionesNecesarias={reportePendiente.confirmacionesNecesarias}
                    onConfirmar={handleConfirmarDesvioOtro}
                    onRechazar={handleRechazarDesvio}
                    onClose={() => {
                        setShowConfirmarDesvio(false);
                        setReportePendiente(null);
                    }}
                />
            )}

            {/* Notificación de desvío confirmado (para usuarios esperando) */}
            {desvioConfirmado && (
                <DesvioNotificacion
                    linea={desvioConfirmado.linea}
                    ramal={desvioConfirmado.ramal}
                    onClose={() => setDesvioConfirmado(null)}
                />
            )}

            {/* Guía de instalación PWA */}
            {showInstallGuide && (
                <InstallGuide onClose={() => setShowInstallGuide(false)} />
            )}

            {/* Banner de instalación PWA */}
            {showInstallBanner && (
                <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-xl z-50 animate-in slide-in-from-top">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📱</span>
                        <div className="flex-1">
                            <p className="font-bold">Instalá Bondify</p>
                            <p className="text-xs text-indigo-100">Acceso rápido desde tu pantalla de inicio</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowInstallBanner(false);
                                setShowInstallGuide(true);
                            }}
                            className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-sm font-bold"
                        >
                            Instalar
                        </button>
                        <button
                            onClick={() => {
                                setShowInstallBanner(false);
                                localStorage.setItem('bondify_install_dismissed', 'true');
                            }}
                            className="text-indigo-200 hover:text-white text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Garage Screen Overlay */}
            {isGarageOpen && profile.mode === UserMode.COMMUNITY && (
                <Garage
                    gameState={profile.garage}
                    onUpdateColor={updateBusColor}
                    onClose={() => setIsGarageOpen(false)}
                    onOpenSettings={() => setShowProfileSettings(true)}
                />
            )}

            {/* Profile Settings Overlay */}
            {showProfileSettings && (
                <ProfileSettings
                    currentMode={profile.mode}
                    routines={profile.routines}
                    onModeChange={handleModeChange}
                    onUpdateRoutines={handleUpdateRoutines}
                    onClose={() => setShowProfileSettings(false)}
                    isPresentationMode={profile.isPresentationMode}
                    onTogglePresentationMode={handleTogglePresentationMode}
                />
            )}

            {/* Favoritos Overlay */}
            {showFavoritos && (
                <Favoritos
                    userId={userId}
                    onClose={() => setShowFavoritos(false)}
                />
            )}

            {/* Historial Overlay */}
            {showHistorial && (
                <Historial
                    userId={userId}
                    onClose={() => setShowHistorial(false)}
                />
            )}

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-slate-200 pb-safe pt-3 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
                <div className="flex items-center justify-around h-16">

                    {/* Favoritos Button */}
                    <button
                        onClick={() => {
                            setShowFavoritos(true);
                            setIsGarageOpen(false);
                            setShowProfileSettings(false);
                            setShowHistorial(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-colors ${showFavoritos ? 'text-yellow-600' : 'text-slate-400'}`}
                    >
                        <div className={`p-1 rounded-full ${showFavoritos ? 'bg-yellow-100' : ''}`}>
                            <Star className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold">Favoritos</span>
                    </button>

                    {/* Toggle Role Button */}
                    <button
                        onClick={toggleRole}
                        className={`flex flex-col items-center gap-1 transition-colors ${profile.role === UserRole.TRAVELER ? 'text-green-600' : 'text-slate-400'}`}
                    >
                        <div className={`p-1 rounded-full ${profile.role === UserRole.TRAVELER ? 'bg-green-100' : ''}`}>
                            <Power className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold">
                            {profile.role === UserRole.TRAVELER ? 'Viajando' : 'Esperando'}
                        </span>
                    </button>

                    {/* Main Map Button (Center) */}
                    <div className="relative -top-6">
                        <button
                            onClick={() => {
                                setIsGarageOpen(false);
                                setShowProfileSettings(false);
                                setShowFavoritos(false);
                                setShowHistorial(false);
                            }}
                            className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/30 active:scale-95 transition-transform border-4 border-slate-100"
                        >
                            <Map className="w-7 h-7" />
                        </button>
                    </div>

                    {/* Historial Button */}
                    <button
                        onClick={() => {
                            setShowHistorial(true);
                            setIsGarageOpen(false);
                            setShowProfileSettings(false);
                            setShowFavoritos(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-colors ${showHistorial ? 'text-purple-600' : 'text-slate-400'}`}
                    >
                        <div className={`p-1 rounded-full ${showHistorial ? 'bg-purple-100' : ''}`}>
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold">Historial</span>
                    </button>

                    {/* Garage/Profile Button */}
                    <button
                        onClick={() => {
                            if (profile.mode === UserMode.COMMUNITY) {
                                setIsGarageOpen(true);
                            } else {
                                setShowProfileSettings(true);
                            }
                            setShowFavoritos(false);
                            setShowHistorial(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-colors ${isGarageOpen || showProfileSettings ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                        {profile.mode === UserMode.COMMUNITY ? (
                            <>
                                <div className={`p-1 rounded-full ${isGarageOpen ? 'bg-indigo-100' : ''}`}>
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold">Garage</span>
                            </>
                        ) : (
                            <>
                                <div className={`p-1 rounded-full ${showProfileSettings ? 'bg-indigo-100' : ''}`}>
                                    <User className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold">Perfil</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;