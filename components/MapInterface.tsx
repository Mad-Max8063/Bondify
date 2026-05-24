import React, { useState, useEffect } from 'react';
import { BusEntity, BusStatus, UserRole, ChaosReport, ReportType, DemoAction, BusStop } from '../types';
import { MOCK_BUSES, MOCK_REPORTS } from '../constants';
import { MOCK_STOPS } from '../stops';
import { MapView } from './MapView';
import { Button } from './Button';
import { analizarIncidente } from '../services/gemini';
import { colectivosAPI, checkBackendHealth } from '../services/api';
import { Search, Navigation, Shield, Clock, Users, AlertTriangle, AlertOctagon, X, Check, Loader2, RouteOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MapInterfaceProps {
    userRole: UserRole;
    onAddPoints: (points: number) => void;
    demoAction?: DemoAction | null;
    userLocation?: { lat: number; lng: number } | null;
}

export const MapInterface: React.FC<MapInterfaceProps> = ({ userRole, onAddPoints, demoAction, userLocation }) => {
    const { t, language } = useLanguage();
    const [buses, setBuses] = useState<BusEntity[]>(MOCK_BUSES);
    const [reports, setReports] = useState<ChaosReport[]>(MOCK_REPORTS);
    const [stops, setStops] = useState<BusStop[]>(MOCK_STOPS);
    const [selectedBus, setSelectedBus] = useState<BusEntity | null>(null);
    const [showStopwatch, setShowStopwatch] = useState(false);
    const [showChaosMenu, setShowChaosMenu] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [useRealData, setUseRealData] = useState(false);
    const [mapInstance, setMapInstance] = useState<any>(null);

    // Check backend health and load real data
    useEffect(() => {
        const initBackend = async () => {
            const isHealthy = await checkBackendHealth();
            if (isHealthy) {
                console.log('✅ Backend conectado, usando datos reales');
                setUseRealData(true);
                loadBusesFromBackend();
            } else {
                console.log('⚠️  Backend no disponible, usando datos mock');
                setUseRealData(false);
            }
        };

        initBackend();
    }, []);

    // Dynamically relocate mock data to user's location for global demo compatibility!
    useEffect(() => {
        if (userLocation && userLocation.lat && userLocation.lng) {
            console.log(`🌍 Relocating demo mock data around user coordinates: [${userLocation.lat}, ${userLocation.lng}]`);
            
            const relocatedBuses: BusEntity[] = [
                {
                    id: 'b1',
                    line: language === 'es' ? '152' : 'Line 152',
                    status: BusStatus.VERIFIED,
                    lat: userLocation.lat + 0.001,
                    lng: userLocation.lng - 0.001,
                    heading: 320,
                    passengers: 4,
                    lastUpdate: Date.now(),
                    destination: language === 'es' ? 'Centro' : 'Downtown',
                    arrivalEstimate: 3
                },
                {
                    id: 'b2',
                    line: language === 'es' ? '60' : 'Line 60',
                    status: BusStatus.GHOST,
                    lat: userLocation.lat - 0.002,
                    lng: userLocation.lng + 0.002,
                    heading: 140,
                    passengers: 0,
                    lastUpdate: Date.now() - 300000,
                    destination: language === 'es' ? 'Terminal' : 'Terminal Station',
                    arrivalEstimate: 11
                },
                {
                    id: 'b3',
                    line: language === 'es' ? '29' : 'Line 29',
                    status: BusStatus.TRAIL,
                    lat: userLocation.lat + 0.002,
                    lng: userLocation.lng - 0.002,
                    heading: 310,
                    passengers: 0,
                    lastUpdate: Date.now() - 60000,
                    destination: language === 'es' ? 'Estación Norte' : 'North Station',
                    arrivalEstimate: 7
                }
            ];

            const relocatedReports: ChaosReport[] = [
                {
                    id: 'r1',
                    type: ReportType.PICKET,
                    lat: userLocation.lat + 0.0008,
                    lng: userLocation.lng + 0.0008,
                    timestamp: Date.now()
                }
            ];

            const relocatedStops: BusStop[] = [
                {
                    id: 's1',
                    name: language === 'es' ? 'Parada Plaza Principal' : 'Main Square Station',
                    lat: userLocation.lat + 0.0005,
                    lng: userLocation.lng - 0.0005,
                    lines: ['152', '60']
                },
                {
                    id: 's2',
                    name: language === 'es' ? 'Estación Central' : 'Central Station',
                    lat: userLocation.lat - 0.0012,
                    lng: userLocation.lng + 0.0012,
                    lines: ['152', '29']
                },
                {
                    id: 's3',
                    name: language === 'es' ? 'Avenida y 5ta Calle' : 'Avenue & 5th St',
                    lat: userLocation.lat + 0.0018,
                    lng: userLocation.lng - 0.0018,
                    lines: ['60', '29']
                }
            ];

            setBuses(relocatedBuses);
            setReports(relocatedReports);
            setStops(relocatedStops);
        }
    }, [userLocation, language]);

    // Load buses from backend
    const loadBusesFromBackend = async () => {
        try {
            const busesFromBackend = await colectivosAPI.obtenerActivos();
            if (busesFromBackend.length > 0) {
                setBuses(busesFromBackend);
                console.log(`📍 ${busesFromBackend.length} colectivos cargados desde backend`);
            }
        } catch (error) {
            console.error('Error cargando colectivos:', error);
        }
    };

    // Refresh buses from backend every 5 seconds
    useEffect(() => {
        if (!useRealData) return;

        const interval = setInterval(() => {
            loadBusesFromBackend();
        }, 5000);

        return () => clearInterval(interval);
    }, [useRealData]);

    // Handle demo actions
    useEffect(() => {
        if (!demoAction) return;

        if (demoAction.type === 'CHAOS') {
            handleReportChaos(ReportType.BROKEN);
        } else if (demoAction.type === 'GHOST') {
            const newBus: BusEntity = {
                id: `ghost-${Date.now()}`,
                line: '60',
                status: BusStatus.VERIFIED,
                lat: -34.5828 + (Math.random() * 0.002 - 0.001),
                lng: -58.4215 + (Math.random() * 0.002 - 0.001),
                heading: 0,
                passengers: 5,
                lastUpdate: Date.now(),
                destination: 'Constitución',
                arrivalEstimate: 1
            };
            setBuses(prev => [...prev, newBus]);
            setSelectedBus(newBus); // Auto select it
        }
    }, [demoAction]);

    // Simulate bus movement only for mock data
    useEffect(() => {
        if (useRealData) return; // Don't simulate if using real data

        const interval = setInterval(() => {
            setBuses(currentBuses =>
                currentBuses.map(bus => {
                    // Simulate movement generally Northwest (along Av Santa Fe/Cabildo)
                    // Small delta for lat/lng
                    const dLat = (Math.random() * 0.0001) - 0.00005; // Jitter
                    const dLng = (Math.random() * 0.0001) - 0.00005;

                    // General direction drift (North West)
                    const driftLat = 0.00005; // Moving North (negative lat gets more negative)
                    const driftLng = 0.00005; // Moving West (negative lng gets more negative)

                    return {
                        ...bus,
                        lat: bus.lat - (driftLat * 0.2) + dLat,
                        lng: bus.lng - (driftLng * 0.2) + dLng
                    };
                })
            );
        }, 1000); // Slower update for maps
        return () => clearInterval(interval);
    }, [useRealData]);

    const handleBusClick = (bus: BusEntity) => {
        setSelectedBus(bus);
        setShowStopwatch(false);
        setShowChaosMenu(false);
    };

    const handleNotifyMe = () => {
        setShowStopwatch(true);
        setTimeout(() => {
            alert("🔔 ¡Sal AHORA! Tu colectivo está a la vuelta.");
        }, 5000);
    };

    const handleArrived = () => {
        setShowStopwatch(false);
        setShowFeedbackModal(true);
    };

    const submitFeedback = (type: 'safety' | 'time' | 'thanks') => {
        onAddPoints(50);
        setShowFeedbackModal(false);
        alert("¡Gracias! Tu reporte ayuda a toda la comunidad en tiempo real.");
    };

    const handleReportChaos = async (type: ReportType) => {
        setIsReporting(true);

        // Create optimistic report immediately (Mock location)
        const newReport: ChaosReport = {
            id: Math.random().toString(),
            type,
            lat: -34.5828, // Mock near center
            lng: -58.4215,
            timestamp: Date.now()
        };
        setReports(prev => [...prev, newReport]);

        // Construct a descriptive text for the AI
        const description = type === ReportType.PICKET ? "Hay un piquete cortando la calle"
            : type === ReportType.ACCIDENT ? "Hubo un accidente de tránsito grave"
                : type === ReportType.BROKEN ? "El colectivo se rompió y nos hicieron bajar"
                    : type === ReportType.DEVIATION ? "El colectivo se está desviando de su recorrido habitual"
                        : "La estación de tren/subte está cerrada";

        // Get AI Analysis
        let consejo = "";
        try {
            const analisis = await analizarIncidente(description);
            consejo = analisis.consejo;
        } catch (e) {
            consejo = "Reporte registrado. ¡Gracias!";
        }

        setIsReporting(false);
        setShowChaosMenu(false);

        // CRITICAL FIX: Set status to PROBLEM instead of GHOST
        if (type === ReportType.BROKEN && selectedBus) {
            setBuses(prev => prev.map(b => b.id === selectedBus.id ? { ...b, status: BusStatus.PROBLEM } : b));
        }

        // SPECIAL HANDLING: DEVIATION needs confirmations
        if (type === ReportType.DEVIATION && selectedBus) {
            setBuses(prev => prev.map(b => {
                if (b.id === selectedBus.id) {
                    const newCount = (b.deviationReports || 0) + 1;
                    // If 3 people report it (simulated threshold), flag it as PROBLEM
                    if (newCount >= 3) {
                        return { ...b, status: BusStatus.PROBLEM, deviationReports: newCount };
                    }
                    return { ...b, deviationReports: newCount };
                }
                return b;
            }));

            // Simulating other users for demo purposes if count is low
            const currentCount = (selectedBus.deviationReports || 0) + 1;
            if (currentCount < 3) {
                alert(`⚠️ Reporte de Desvío enviado.\nSe necesitan ${3 - currentCount} confirmaciones más de otros pasajeros para alertar a todos.`);
            } else {
                alert(`🚨 ¡ALERTA CONFIRMADA!\nEl desvío ha sido verificado por varios pasajeros.`);
            }
        }

        alert(`📢 Consejo de Bondify:\n${consejo}`);
    };

    return (
        <div className="relative w-full h-full bg-obsidian overflow-hidden">

            {/* Real Google Map */}
            <MapView
                buses={buses}
                reports={reports}
                onBusClick={handleBusClick}
                selectedBusId={selectedBus?.id}
                userLocation={userLocation}
                onMapReady={setMapInstance}
                stops={stops}
            />

            {/* UI OVERLAYS (Must be z-index > map) */}

            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 pointer-events-auto">
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                    <Search className="text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('map_search_placeholder')}
                        className="flex-1 bg-transparent outline-none text-slate-100 font-medium placeholder-slate-400 text-sm"
                    />
                </div>
            </div>

            {/* Bottom Sheet / Info Card */}
            {selectedBus && !showFeedbackModal && (
                <div className={`absolute bottom-20 left-4 right-4 glass-card rounded-3xl p-5 z-30 animate-in slide-in-from-bottom duration-300 pointer-events-auto border transition-all ${
                    selectedBus.status === BusStatus.VERIFIED ? 'glow-green border-luminous-green/30' :
                    selectedBus.status === BusStatus.PROBLEM ? 'glow-red border-red-500/30' :
                    'border-slate-700/50 shadow-[0_10px_35px_rgba(0,0,0,0.4)]'
                }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-slate-100">
                                    {language === 'es' ? `Línea ${selectedBus.line}` : `Line ${selectedBus.line}`}
                                </h2>
                                {selectedBus.status === BusStatus.VERIFIED && (
                                    <span className="bg-luminous-green/20 text-luminous-green text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                                        <Shield size={10} /> {t('map_status_verified')}
                                    </span>
                                )}
                                {selectedBus.status === BusStatus.GHOST && (
                                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                                        {language === 'es' ? 'Datos Oficiales' : 'Official Schedule'}
                                    </span>
                                )}
                                {selectedBus.status === BusStatus.PROBLEM && (
                                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                                        <AlertTriangle size={10} /> {t('map_status_problem')}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 text-sm mt-0.5">
                                {language === 'es' ? `Hacia ${selectedBus.destination}` : `To ${selectedBus.destination}`}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-indigo-400">{selectedBus.arrivalEstimate}'</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                                {language === 'es' ? 'minutos' : 'minutes'}
                            </p>
                        </div>
                    </div>

                    {selectedBus.status === BusStatus.VERIFIED && (
                        <div className="bg-luminous-green/10 border border-luminous-green/10 rounded-xl p-3 mb-4 flex items-center gap-3">
                            <div className="bg-luminous-green/20 p-2 rounded-lg">
                                <Users className="w-4 h-4 text-luminous-green" />
                            </div>
                            <p className="text-xs text-slate-300 font-medium">
                                <strong className="text-luminous-green">{language === 'es' ? 'Usuarios a bordo' : 'Users on board'}</strong> {language === 'es' ? 'compartiendo ubicación en vivo.' : 'sharing live location details.'}
                            </p>
                        </div>
                    )}

                    {selectedBus.status === BusStatus.PROBLEM && (
                        <div className="bg-red-500/10 border border-red-500/15 rounded-xl p-3 mb-4 flex items-center gap-3">
                            <div className="bg-red-500/20 p-2 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                            <p className="text-xs text-red-300 font-medium">
                                <strong className="text-red-400">{language === 'es' ? '¡Cuidado!' : 'Warning!'}</strong> {language === 'es' ? 'Reportaron desperfectos o desvíos en esta unidad.' : 'Active delays or detour routes reported on this bus.'}
                            </p>
                        </div>
                    )}

                    {showStopwatch ? (
                        <div className="flex gap-2">
                            <div className="flex-1 bg-red-500/10 border border-red-500/15 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-red-400 w-5 h-5 animate-pulse" />
                                    <div>
                                        <p className="font-bold text-red-400 text-sm">{language === 'es' ? 'Esperando...' : 'Waiting...'}</p>
                                        <p className="text-[9px] text-red-500">{language === 'es' ? 'Te notificaremos' : 'We will notify you'}</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="community" onClick={handleArrived} className="flex-1">
                                {language === 'es' ? '👋 ¡Ya subí!' : '👋 I boarded!'}
                            </Button>
                        </div>
                    ) : (
                        <Button variant={selectedBus.status === BusStatus.PROBLEM ? 'danger' : 'primary'} fullWidth onClick={handleNotifyMe}>
                            {selectedBus.status === BusStatus.PROBLEM 
                                ? (language === 'es' ? 'AVISARME IGUAL' : 'NOTIFY ME ANYWAY') 
                                : (language === 'es' ? 'AVISARME CUANDO ESTÉ LLEGANDO' : 'NOTIFY ME ON ARRIVAL')}
                        </Button>
                    )}
                </div>
            )}

            {/* Feedback Modal (Aplauso del Andén) */}
            {showFeedbackModal && (
                <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-700/50 animate-in slide-in-from-bottom pointer-events-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-luminous-green/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Check className="w-8 h-8 text-luminous-green" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-100">{language === 'es' ? '¡Llegaste!' : 'Arrived!'}</h3>
                            <p className="text-slate-400 text-sm mt-1">{language === 'es' ? '¿Cómo estuvo la espera?' : 'How was the wait?'}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            <button onClick={() => submitFeedback('safety')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-400 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                                {language === 'es' ? '🛡️ ¡Esperé seguro!' : '🛡️ I felt safe!'}
                            </button>
                            <button onClick={() => submitFeedback('time')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-luminous-green p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                                {language === 'es' ? '⏱️ ¡Gané tiempo!' : '⏱️ Saved time!'}
                            </button>
                            <button onClick={() => submitFeedback('thanks')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                                {language === 'es' ? '🙏 ¡Gracias!' : '🙏 Thanks!'}
                            </button>
                        </div>

                        <button onClick={() => setShowFeedbackModal(false)} className="w-full py-2 text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors">
                            {language === 'es' ? 'Omitir' : 'Skip'}
                        </button>
                    </div>
                </div>
            )}

            {/* FAB for Recenter */}
            <button
                onClick={() => {
                    if (mapInstance && userLocation) {
                        mapInstance.setView([userLocation.lat, userLocation.lng], 16);
                    }
                }}
                className={`absolute bottom-24 right-4 p-3 rounded-full shadow-lg transition-all z-20 pointer-events-auto border ${userLocation ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
            >
                <Navigation className="w-6 h-6" />
            </button>
        </div>
    );
};