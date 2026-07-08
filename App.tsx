import React, { useState, useEffect } from 'react';
import { UserMode, UserRole, UserProfile, GarageState, Routine, DemoAction } from './types';
import { INITIAL_GARAGE } from './constants';
import { Onboarding } from './components/Onboarding';
import { MapInterface } from './components/MapInterface';
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
import { Map, Power, User, Star, Clock } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { usuariosAPI, colectivosAPI } from './services/api';
import {
    rotateTripId,
    activatePanicMode
} from './utils/privacy';

// Importar Custom Hooks
import { useRouteDeviation } from './hooks/useRouteDeviation';
import { useGeolocation } from './hooks/useGeolocation';
import { useCommunityReports } from './hooks/useCommunityReports';

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
    const { t } = useLanguage();
    const [userId] = useState(getUserId());
    const [profile, setProfile] = useState<UserProfile>({
        mode: UserMode.EFFICIENT,
        role: UserRole.WAITER,
        garage: INITIAL_GARAGE,
        hasOnboarded: false,
        isPresentationMode: false
    });

    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [showFavoritos, setShowFavoritos] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showTravelerNudge, setShowTravelerNudge] = useState(false);
    const [nudgeRoutine, setNudgeRoutine] = useState<Routine | null>(null);
    const [demoAction, setDemoAction] = useState<DemoAction | null>(null);
    const [showActivarViajero, setShowActivarViajero] = useState(false);

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

    const addPoints = async (amount: number) => {
        console.log(`[Points] +${amount} points for collaborative action.`);
    };

    // 1. Hook para verificar desviaciones de la ruta habitual
    const {
        showDesviacionAlert,
        setShowDesviacionAlert,
        rutinaUsuario,
        setRutinaUsuario,
        verificarDesviacion
    } = useRouteDeviation();

    // 2. Hook para orquestar Geolocalización (GPS) y pings
    const {
        lineaActual,
        ramalActual,
        compartiendoUbicacion,
        userLocation,
        ubicacionesRecientes,
        iniciarCompartirUbicacion,
        detenerCompartirUbicacion
    } = useGeolocation({
        userId,
        profile,
        setProfile,
        addPoints,
        verificarDesviacion,
        showDesviacionAlert,
        setShowDesviacionAlert,
        setRutinaUsuario
    });

    // 3. Hook para validar socialmente los reportes de desvíos y recibir alertas
    const {
        reportePendiente,
        showConfirmarDesvio,
        setShowConfirmarDesvio,
        desvioConfirmado,
        setDesvioConfirmado,
        handleConfirmarDesvioOtro,
        handleRechazarDesvio
    } = useCommunityReports({
        userId,
        compartiendoUbicacion,
        lineaActual,
        showDesviacionAlert,
        addPoints
    });

    const toggleRole = () => {
        const nuevoRole = profile.role === UserRole.WAITER ? UserRole.TRAVELER : UserRole.WAITER;

        if (nuevoRole === UserRole.TRAVELER) {
            // Activar modo viajero - mostrar modal para seleccionar línea
            // Nota: el estado 'showActivarViajero' debería ser manejado a través del hook si se desea consistencia total
            // Manteniendo lógica de estado local original por compatibilidad con el componente
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

    // Handlers para el alert de desviación de ruta
    const handleConfirmarBajada = async () => {
        setShowDesviacionAlert(false);
        await detenerCompartirUbicacion();
        setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
        alert('✅ Gracias por avisar. El colectivo se mostrará en gris (estimado) para otros usuarios.');
    };

    const handleConfirmarDesvio = async () => {
        setShowDesviacionAlert(false);

        // Crear reporte de desvío
        try {
            await colectivosAPI.enviarReporte({
                texto: `Desvío en la línea ${lineaActual}`,
                linea: lineaActual,
                lat: ubicacionesRecientes[ubicacionesRecientes.length - 1]?.lat || -34.58,
                lng: ubicacionesRecientes[ubicacionesRecientes.length - 1]?.lng || -58.42
            });
            await addPoints(10);
            alert('✅ Reporte de desvío enviado. +10 puntos');
        } catch (error) {
            console.error('Error creando reporte de desvío:', error);
        }
    };

    const handleSeguirViajando = () => {
        setShowDesviacionAlert(false);
        // Actualizar la rutina del usuario con las nuevas ubicaciones
        setRutinaUsuario(prev => [...prev, ...ubicacionesRecientes.slice(-3)]);
        alert('✅ Tu ruta habitual se actualizó.');
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

            // Only nudge if we aren't already in the role or recently notified
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
        <div className="h-dynamic w-full flex flex-col bg-obsidian text-slate-100 font-sans overflow-hidden">

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
                    onActivar={(linea, ramal) => {
                        iniciarCompartirUbicacion(linea, ramal);
                        setShowActivarViajero(false);
                    }}
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
            <div className="glass-nav pb-safe pt-3 px-4 z-40 rounded-t-[2rem] border-t-0 shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-around h-16">

                    {/* Favoritos Button */}
                    <button
                        onClick={() => {
                            setShowFavoritos(true);
                            setShowProfileSettings(false);
                            setShowHistorial(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${showFavoritos ? 'text-luminous-amber scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${showFavoritos ? 'bg-luminous-amber/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : ''}`}>
                            <Star className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">{t('nav_favorites')}</span>
                    </button>

                    {/* Toggle Role Button */}
                    <button
                        onClick={toggleRole}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${profile.role === UserRole.TRAVELER ? 'text-luminous-green scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${profile.role === UserRole.TRAVELER ? 'bg-luminous-green/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : ''}`}>
                            <Power className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">
                            {profile.role === UserRole.TRAVELER ? t('nav_traveling') : t('nav_waiting')}
                        </span>
                    </button>

                    {/* Main Map Button (Center) */}
                    <div className="relative -top-7">
                        <button
                            onClick={() => {
                                setShowProfileSettings(false);
                                setShowFavoritos(false);
                                setShowHistorial(false);
                            }}
                            className="w-15 h-15 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.6)] active:scale-95 transition-all border-[3px] border-obsidian-light"
                        >
                            <Map className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Historial Button */}
                    <button
                        onClick={() => {
                            setShowHistorial(true);
                            setShowProfileSettings(false);
                            setShowFavoritos(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${showHistorial ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${showHistorial ? 'bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]' : ''}`}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">{t('nav_history')}</span>
                    </button>

                    {/* Profile Button */}
                    <button
                        onClick={() => {
                            setShowProfileSettings(true);
                            setShowFavoritos(false);
                            setShowHistorial(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${showProfileSettings ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className={`p-1.5 rounded-xl transition-colors ${showProfileSettings ? 'bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.2)]' : ''}`}>
                            <User className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">{t('nav_profile')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;