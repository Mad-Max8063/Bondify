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

    const updateBusColor = (color: string) => {
        setProfile(prev => ({
            ...prev,
            garage: { ...prev.garage, busColor: color }
        }));
    };

    // Efecto de decaimiento emocional por inactividad (Tamagotchi)
    useEffect(() => {
        if (profile.hasOnboarded && profile.garage.accessories.includes('ojitos_vida')) {
            const horasPasadas = Math.floor((Date.now() - profile.garage.lastCollaboration) / (1000 * 60 * 60));
            if (horasPasadas > 0) {
                const decaimiento = horasPasadas * 2;
                const nuevaFelicidad = Math.max(0, profile.garage.happiness - decaimiento);
                
                if (nuevaFelicidad !== profile.garage.happiness) {
                    setProfile(prev => ({
                        ...prev,
                        garage: {
                            ...prev.garage,
                            happiness: nuevaFelicidad
                        }
                    }));
                    if (userId) {
                        usuariosAPI.actualizarGarage(userId, { felicidad: nuevaFelicidad });
                    }
                }
            }
        }
    }, [profile.hasOnboarded, profile.garage.accessories, profile.garage.lastCollaboration, profile.garage.happiness, userId]);

    const addPoints = async (amount: number) => {
        if (profile.mode === UserMode.COMMUNITY) {
            let cobroVida = false;
            
            setProfile(prev => {
                const tieneOjitos = prev.garage.accessories.includes('ojitos_vida');
                let nuevosAccesorios = [...prev.garage.accessories];
                let nuevaFelicidad = prev.garage.happiness;
                
                if (!tieneOjitos) {
                    // HITO: ¡Primera colaboración! El colectivo cobra vida
                    nuevosAccesorios.push('ojitos_vida');
                    nuevaFelicidad = 50; // Comienza un poco triste/cansado
                    cobroVida = true;
                } else {
                    // Incrementar felicidad por colaborar
                    nuevaFelicidad = Math.min(100, prev.garage.happiness + 25);
                }

                return {
                    ...prev,
                    garage: {
                        ...prev.garage,
                        points: prev.garage.points + amount,
                        accessories: nuevosAccesorios,
                        happiness: nuevaFelicidad,
                        lastCollaboration: Date.now()
                    }
                };
            });

            // Sincronizar con backend
            if (userId) {
                await usuariosAPI.actualizarGarage(userId, { 
                    puntos: amount,
                    felicidad: profile.garage.accessories.includes('ojitos_vida') ? Math.min(100, profile.garage.happiness + 25) : 50,
                    ultimaColaboracion: Date.now()
                });
            }

            if (cobroVida) {
                setTimeout(() => {
                    alert('🎉 ¡TU BONDI COBRÓ VIDA! 🚌👀\n\nAcabas de desbloquear el accesorio tradicional "Ojitos de Parabrisas" por tu primera colaboración.\n\nAl principio se siente un poco triste porque nadie viajaba con él. ¡Colaborá diariamente para ver su sonrisa y enderezar su trompa!');
                }, 800);
            }
        }
    };

    // Manejar compras de accesorios en el Garage
    const handleBuyAccessory = async (id: string, cost: number) => {
        if (profile.garage.points < cost) {
            alert('❌ No tenés suficientes puntos para comprar este adorno.');
            return;
        }

        setProfile(prev => ({
            ...prev,
            garage: {
                ...prev.garage,
                points: prev.garage.points - cost,
                accessories: [...prev.garage.accessories, id],
                happiness: 100, // ¡Comprar accesorios le da felicidad máxima!
                lastCollaboration: Date.now()
            }
        }));

        if (userId) {
            await usuariosAPI.actualizarGarage(userId, {
                puntos: -cost,
                accesorios: [...profile.garage.accessories, id],
                felicidad: 100,
                ultimaColaboracion: Date.now()
            });
        }

        alert('✨ ¡Adorno comprado! Tu colectivo está rebosante de alegría. +100% de felicidad');
    };

    // Equipar/Desequipar accesorios ya comprados
    const handleEquipAccessory = async (id: string) => {
        setProfile(prev => {
            const yaEquipado = prev.garage.accessories.includes(id);
            let nuevosAccesorios = [];
            
            if (yaEquipado) {
                // Desequipar (Excepto los ojitos de parabrisas que no se pueden sacar una vez desbloqueados)
                if (id === 'ojitos_vida') return prev;
                nuevosAccesorios = prev.garage.accessories.filter(accId => accId !== id);
            } else {
                // Equipar
                nuevosAccesorios = [...prev.garage.accessories, id];
            }

            if (userId) {
                usuariosAPI.actualizarGarage(userId, { accesorios: nuevosAccesorios });
            }

            return {
                ...prev,
                garage: {
                    ...prev.garage,
                    accessories: nuevosAccesorios
                }
            };
        });
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

            {/* Garage Screen Overlay */}
            {isGarageOpen && profile.mode === UserMode.COMMUNITY && (
                <Garage
                    gameState={profile.garage}
                    onUpdateColor={updateBusColor}
                    onEquipAccessory={handleEquipAccessory}
                    onBuyAccessory={handleBuyAccessory}
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