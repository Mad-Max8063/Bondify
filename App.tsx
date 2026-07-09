import React, { useState, useEffect } from 'react';
import { UserMode, UserRole, UserProfile, Routine, DemoAction } from './types';
import { Onboarding } from './components/Onboarding';
import { MapInterface } from './components/MapInterface';
import { ProfileSettings } from './components/ProfileSettings';
import { SmartNudge } from './components/SmartNudge';
import { DemoControls } from './components/DemoControls';
import { DemoBanner } from './components/DemoBanner';
import { Favoritos } from './components/Favoritos';
import { Historial } from './components/Historial';
import { WazeReportButton } from './components/WazeReportButton';
import { ActivarViajeroModal } from './components/ActivarViajeroModal';
import { CompartiendoUbicacion } from './components/CompartiendoUbicacion';
import { DesviacionAlert } from './components/DesviacionAlert';
import { ConfirmarDesvioAlert } from './components/ConfirmarDesvioAlert';
import { DesvioNotificacion } from './components/DesvioNotificacion';
import { InstallGuide } from './components/InstallGuide';
import { Map, Power, User, Star, Clock, Smartphone, X } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useToast } from './contexts/ToastContext';
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
    const { showToast } = useToast();
    const [userId] = useState(getUserId());
    const [profile, setProfile] = useState<UserProfile>({
        mode: UserMode.EFFICIENT,
        role: UserRole.WAITER,
        hasOnboarded: false,
        demoMode: false
    });

    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [showFavoritos, setShowFavoritos] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
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

    const handleToggleDemoMode = () => {
        setProfile(prev => ({ ...prev, demoMode: !prev.demoMode }));
    };

    const handleExitDemo = () => {
        setProfile(prev => ({ ...prev, demoMode: false }));
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

    // Los puntos los otorga SIEMPRE el servidor; esto solo notifica en la UI.
    const addPoints = async (amount: number) => {
        if (amount > 0) {
            showToast(t('points_earned').replace('{n}', String(amount)), 'success');
        }
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
        setReportePendiente,
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

    const abrirModoViajero = () => {
        if (profile.demoMode) {
            showToast(t('demo_blocked_action'), 'info');
            return;
        }
        setShowActivarViajero(true);
    };

    const toggleRole = () => {
        if (profile.role === UserRole.WAITER) {
            // Activar modo viajero: el rol cambia recién cuando el usuario
            // confirma línea y consentimiento en el modal.
            abrirModoViajero();
        } else {
            // Desactivar modo viajero
            detenerCompartirUbicacion();
            // Rotar ID de viaje por privacidad al terminar viaje
            rotateTripId();
            setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
        }
    };

    // Handlers para el alert de desviación de ruta
    const handleConfirmarBajada = async () => {
        setShowDesviacionAlert(false);
        await detenerCompartirUbicacion();
        setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
        showToast(t('deviation_thanks'), 'success');
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
            showToast(t('deviation_reported'), 'success');
        } catch (error) {
            console.error('Error creando reporte de desvío:', error);
        }
    };

    const handleSeguirViajando = () => {
        setShowDesviacionAlert(false);
        // Actualizar la rutina del usuario con las nuevas ubicaciones
        setRutinaUsuario(prev => [...prev, ...ubicacionesRecientes.slice(-3)]);
        showToast(t('route_updated'), 'success');
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
        <div className="h-dynamic w-full flex flex-col bg-ink-950 text-zinc-100 font-sans overflow-hidden">

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
                    demoMode={!!profile.demoMode}
                    onRequestTraveler={abrirModoViajero}
                    onStartDemo={() => setProfile(prev => ({ ...prev, demoMode: true }))}
                />

                {/* Banner fijo mientras el modo demo está activo */}
                {profile.demoMode && <DemoBanner onExit={handleExitDemo} />}

                {profile.demoMode && (
                    <DemoControls
                        onTriggerNudge={handleDemoNudge}
                        onTriggerChaos={handleDemoChaos}
                        onAddGhostBus={handleDemoGhostBus}
                    />
                )}
            </div>

            {/* Modal para activar modo viajero */}
            {showActivarViajero && (
                <ActivarViajeroModal
                    onActivar={(linea, ramal) => {
                        setShowActivarViajero(false);
                        setProfile(prev => ({ ...prev, role: UserRole.TRAVELER }));
                        iniciarCompartirUbicacion(linea, ramal);
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
                    onDetener={() => {
                        detenerCompartirUbicacion();
                        rotateTripId();
                        setProfile(prev => ({ ...prev, role: UserRole.WAITER }));
                    }}
                    usuariosViendote={0} // No se usa más el número exacto
                    onPanic={activatePanicMode}
                />
            )}

            {/* Botón de Reporte estilo Waze - se coloca aquí para tener mayor z-index */}
            <WazeReportButton
                onReportCreated={() => addPoints(10)}
                userLocation={userLocation}
                lineaActual={lineaActual}
                demoMode={!!profile.demoMode}
            />

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
                <div className="fixed top-4 left-4 right-4 glass-card border-led-500/30 text-zinc-100 p-4 rounded-card z-banner animate-in slide-in-from-top">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-led-400 shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">{t('install_banner_title')}</p>
                            <p className="text-xs text-zinc-400">{t('install_banner_desc')}</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowInstallBanner(false);
                                setShowInstallGuide(true);
                            }}
                            className="bg-led-500 text-ink-950 px-3 py-1.5 rounded-field text-sm font-bold active:scale-98 transition-transform"
                        >
                            {t('install_banner_cta')}
                        </button>
                        <button
                            onClick={() => {
                                setShowInstallBanner(false);
                                localStorage.setItem('bondify_install_dismissed', 'true');
                            }}
                            className="text-zinc-500 hover:text-zinc-200 p-1"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
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
                    demoMode={!!profile.demoMode}
                    onToggleDemoMode={handleToggleDemoMode}
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
            <div className="glass-nav pb-safe pt-2 px-4 z-nav rounded-t-sheet border-t-0">
                <div className="flex items-center justify-around h-16">

                    {/* Favoritos Button */}
                    <button
                        onClick={() => {
                            setShowFavoritos(true);
                            setShowProfileSettings(false);
                            setShowHistorial(false);
                        }}
                        className={`relative flex flex-col items-center gap-1 pt-2 transition-colors duration-300 ${showFavoritos ? 'text-led-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <span className={`absolute top-0 h-0.5 w-6 rounded-full bg-led-400 transition-opacity duration-300 ${showFavoritos ? 'opacity-100' : 'opacity-0'}`} />
                        <Star className="w-5 h-5" />
                        <span className="text-2xs font-bold">{t('nav_favorites')}</span>
                    </button>

                    {/* Toggle Role Button (viajando = estado activo, verde semántico) */}
                    <button
                        onClick={toggleRole}
                        className={`relative flex flex-col items-center gap-1 pt-2 transition-colors duration-300 ${profile.role === UserRole.TRAVELER ? 'text-ok' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <span className={`absolute top-0 h-0.5 w-6 rounded-full bg-ok transition-opacity duration-300 ${profile.role === UserRole.TRAVELER ? 'opacity-100' : 'opacity-0'}`} />
                        <Power className="w-5 h-5" />
                        <span className="text-2xs font-bold">
                            {profile.role === UserRole.TRAVELER ? t('nav_traveling') : t('nav_waiting')}
                        </span>
                    </button>

                    {/* Main Map Button (Center) */}
                    <div className="relative -top-6">
                        <button
                            onClick={() => {
                                setShowProfileSettings(false);
                                setShowFavoritos(false);
                                setShowHistorial(false);
                            }}
                            className="w-14 h-14 bg-led-500 hover:bg-led-400 rounded-card flex items-center justify-center text-ink-950 shadow-fab active:scale-98 transition-all border-4 border-ink-950"
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
                        className={`relative flex flex-col items-center gap-1 pt-2 transition-colors duration-300 ${showHistorial ? 'text-led-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <span className={`absolute top-0 h-0.5 w-6 rounded-full bg-led-400 transition-opacity duration-300 ${showHistorial ? 'opacity-100' : 'opacity-0'}`} />
                        <Clock className="w-5 h-5" />
                        <span className="text-2xs font-bold">{t('nav_history')}</span>
                    </button>

                    {/* Profile Button */}
                    <button
                        onClick={() => {
                            setShowProfileSettings(true);
                            setShowFavoritos(false);
                            setShowHistorial(false);
                        }}
                        className={`relative flex flex-col items-center gap-1 pt-2 transition-colors duration-300 ${showProfileSettings ? 'text-led-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <span className={`absolute top-0 h-0.5 w-6 rounded-full bg-led-400 transition-opacity duration-300 ${showProfileSettings ? 'opacity-100' : 'opacity-0'}`} />
                        <User className="w-5 h-5" />
                        <span className="text-2xs font-bold">{t('nav_profile')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
