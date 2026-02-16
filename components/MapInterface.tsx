import React, { useState, useEffect } from 'react';
import { BusEntity, BusStatus, UserRole, ChaosReport, ReportType, DemoAction } from '../types';
import { MOCK_BUSES, MOCK_REPORTS } from '../constants';
import { MOCK_STOPS } from '../stops';
import { MapView } from './MapView';
import { Button } from './Button';
import { analizarIncidente } from '../services/gemini';
import { colectivosAPI, checkBackendHealth } from '../services/api';
import { Search, Navigation, Shield, Clock, Users, AlertTriangle, AlertOctagon, X, Check, Loader2, RouteOff } from 'lucide-react';

interface MapInterfaceProps {
    userRole: UserRole;
    onAddPoints: (points: number) => void;
    demoAction?: DemoAction | null;
    userLocation?: { lat: number; lng: number } | null;
}

export const MapInterface: React.FC<MapInterfaceProps> = ({ userRole, onAddPoints, demoAction, userLocation }) => {
    const [buses, setBuses] = useState<BusEntity[]>(MOCK_BUSES);
    const [reports, setReports] = useState<ChaosReport[]>(MOCK_REPORTS);
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
        alert("¡Gracias! Sumaste 50 puntos para tu Garage.");
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
        <div className="relative w-full h-full bg-slate-100 overflow-hidden">

            {/* Real Google Map */}
            <MapView
                buses={buses}
                reports={reports}
                onBusClick={handleBusClick}
                selectedBusId={selectedBus?.id}
                userLocation={userLocation}
                onMapReady={setMapInstance}
                stops={MOCK_STOPS}
            />

            {/* UI OVERLAYS (Must be z-index > map) */}

            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 pointer-events-auto">
                <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3">
                    <Search className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="¿Qué línea buscás?"
                        className="flex-1 outline-none text-slate-700 font-medium"
                    />
                </div>
            </div>

            {/* Botón de reporte eliminado - ahora se usa WazeReportButton desde App.tsx */}

            {/* Bottom Sheet / Info Card */}
            {selectedBus && !showFeedbackModal && (
                <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-5 z-30 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-slate-800">Línea {selectedBus.line}</h2>
                                {selectedBus.status === BusStatus.VERIFIED && (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Shield size={12} /> Verificado
                                    </span>
                                )}
                                {selectedBus.status === BusStatus.GHOST && (
                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">
                                        Datos Oficiales
                                    </span>
                                )}
                                {selectedBus.status === BusStatus.PROBLEM && (
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <AlertTriangle size={12} /> Problema
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm">Hacia {selectedBus.destination}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-indigo-600">{selectedBus.arrivalEstimate}'</p>
                            <p className="text-xs text-slate-400 uppercase font-bold">minutos</p>
                        </div>
                    </div>

                    {selectedBus.status === BusStatus.VERIFIED && (
                        <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-3">
                            <div className="bg-green-200 p-2 rounded-full">
                                <Users className="w-4 h-4 text-green-700" />
                            </div>
                            <p className="text-sm text-green-800 font-medium">
                                <strong>Usuarios a bordo</strong> verificando ubicación
                            </p>
                        </div>
                    )}

                    {selectedBus.status === BusStatus.PROBLEM && (
                        <div className="bg-red-50 rounded-lg p-3 mb-4 flex items-center gap-3 border border-red-100">
                            <div className="bg-red-200 p-2 rounded-full">
                                <AlertTriangle className="w-4 h-4 text-red-700" />
                            </div>
                            <p className="text-sm text-red-800 font-medium">
                                <strong>¡Cuidado!</strong> Se reportó un desperfecto o accidente en esta unidad.
                            </p>
                        </div>
                    )}

                    {showStopwatch ? (
                        <div className="flex gap-2">
                            <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-red-500 w-5 h-5 animate-pulse" />
                                    <div>
                                        <p className="font-bold text-red-700 text-sm">Esperando...</p>
                                        <p className="text-[10px] text-red-500">Te avisaremos</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="community" onClick={handleArrived} className="flex-1">
                                👋 ¡Ya subí!
                            </Button>
                        </div>
                    ) : (
                        <Button variant={selectedBus.status === BusStatus.PROBLEM ? 'danger' : 'primary'} fullWidth onClick={handleNotifyMe}>
                            {selectedBus.status === BusStatus.PROBLEM ? 'AVISARME IGUAL' : 'AVISARME CUANDO ESTÉ LLEGANDO'}
                        </Button>
                    )}
                </div>
            )}

            {/* Feedback Modal (Aplauso del Andén) */}
            {showFeedbackModal && (
                <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom pointer-events-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">¡Llegaste!</h3>
                            <p className="text-slate-500">¿Cómo estuvo la espera?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => submitFeedback('safety')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                🛡️ ¡Esperé seguro!
                            </button>
                            <button onClick={() => submitFeedback('time')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                ⏱️ ¡Gané tiempo!
                            </button>
                            <button onClick={() => submitFeedback('thanks')} className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                🙏 ¡Gracias!
                            </button>
                        </div>

                        <button onClick={() => setShowFeedbackModal(false)} className="w-full py-3 text-slate-400 text-sm font-medium">
                            Omitir
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
                className={`absolute bottom-24 right-4 p-3 rounded-full shadow-lg transition-all z-20 pointer-events-auto ${userLocation ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}
            >
                <Navigation className="w-6 h-6" />
            </button>
        </div>
    );
};