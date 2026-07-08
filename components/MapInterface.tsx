import React, { useState, useEffect } from 'react';
import { BusEntity, BusStatus, UserRole, ChaosReport, ReportType, DemoAction, BusStop } from '../types';
import { MapView } from './MapView';
import { Button } from './Button';
import { colectivosAPI, reportesAPI } from '../services/api';
import { calculateDistance } from '../utils/privacy';
import { Geolocation } from '@capacitor/geolocation';
import { Search, Navigation, Shield, Clock, Users, AlertTriangle, X, Check, Bus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useDemoBuses } from '../hooks/useDemoBuses';

interface Location {
    lat: number;
    lng: number;
}

interface MapInterfaceProps {
    userRole: UserRole;
    onAddPoints: (points: number) => void;
    demoAction?: DemoAction | null;
    userLocation?: Location | null;
    demoMode: boolean;
    onRequestTraveler: () => void;
    onStartDemo: () => void;
}

// Mapear tipos de reporte del backend a los marcadores del mapa
const TIPO_TO_REPORT_TYPE: Record<string, ReportType> = {
    piquete: ReportType.PICKET,
    accidente: ReportType.ACCIDENT,
    desvio: ReportType.DEVIATION
};

// Velocidad mínima asumida para estimar arribo (promedio colectivo CABA)
const MIN_SPEED_KMH = 17;

export const MapInterface: React.FC<MapInterfaceProps> = ({
    userRole,
    onAddPoints,
    demoAction,
    userLocation,
    demoMode,
    onRequestTraveler,
    onStartDemo
}) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [buses, setBuses] = useState<BusEntity[]>([]);
    const [reports, setReports] = useState<ChaosReport[]>([]);
    const [selectedBus, setSelectedBus] = useState<BusEntity | null>(null);
    const [showStopwatch, setShowStopwatch] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifyBusId, setNotifyBusId] = useState<string | null>(null);
    const [watcherLocation, setWatcherLocation] = useState<Location | null>(null);

    // Simulación SOLO para el modo demo (rotulado con DemoBanner)
    const demo = useDemoBuses({ active: demoMode, userLocation, language, demoAction });

    const displayBuses = demoMode ? demo.buses : buses;
    const displayReports = demoMode ? demo.reports : reports;
    const displayStops: BusStop[] = demoMode ? demo.stops : [];

    // Ubicación de referencia para calcular distancias/ETA
    const refLocation = userLocation || watcherLocation;

    // Poll del backend: colectivos activos + reportes cercanos.
    // Pausado con la pestaña oculta para no quemar reads.
    useEffect(() => {
        if (demoMode) return;

        const load = async () => {
            if (document.hidden) return;
            const busesFromBackend = await colectivosAPI.obtenerActivos();
            setBuses(busesFromBackend);

            if (refLocation) {
                const cercanos = await reportesAPI.cercanos(refLocation.lat, refLocation.lng);
                setReports(
                    cercanos
                        .filter((r: any) => TIPO_TO_REPORT_TYPE[r.tipo] && r.ubicacion)
                        .map((r: any) => ({
                            id: r.id,
                            type: TIPO_TO_REPORT_TYPE[r.tipo],
                            lat: r.ubicacion.lat,
                            lng: r.ubicacion.lng,
                            timestamp: new Date(r.createdAt).getTime()
                        }))
                );
            }
        };

        load();
        const interval = setInterval(load, 12000);
        return () => clearInterval(interval);
    }, [demoMode, refLocation?.lat, refLocation?.lng]);

    // Calcular ETA honesto: distancia / velocidad (mínimo 17 km/h), o null sin ubicación
    const computeEta = (bus: BusEntity): number | null => {
        if (!refLocation) return bus.arrivalEstimate ?? null;
        const distanciaMetros = calculateDistance(refLocation.lat, refLocation.lng, bus.lat, bus.lng);
        const speedKmh = MIN_SPEED_KMH;
        const minutos = Math.max(1, Math.round((distanciaMetros / 1000) / speedKmh * 60));
        return minutos;
    };

    // Mantener el bondi seleccionado sincronizado con el último poll
    useEffect(() => {
        if (!selectedBus) return;
        const updated = displayBuses.find(b => b.id === selectedBus.id);
        if (updated) {
            setSelectedBus({ ...updated, arrivalEstimate: demoMode ? updated.arrivalEstimate : computeEta(updated) });
        }
    }, [displayBuses]);

    // "Avisame": chequear proximidad real del bondi elegido en cada actualización
    useEffect(() => {
        if (!notifyBusId || !watcherLocation) return;
        const bus = displayBuses.find(b => b.id === notifyBusId);
        if (!bus) return;

        const distancia = calculateDistance(watcherLocation.lat, watcherLocation.lng, bus.lat, bus.lng);
        if (distancia < 600) {
            showToast(t('notify_bus_near'), 'success');
            if (navigator.vibrate) navigator.vibrate(300);
            setNotifyBusId(null);
        }
    }, [displayBuses, notifyBusId, watcherLocation]);

    const handleBusClick = (bus: BusEntity) => {
        setSelectedBus({ ...bus, arrivalEstimate: demoMode ? bus.arrivalEstimate : computeEta(bus) });
        setShowStopwatch(false);
    };

    // "Avisame cuando esté llegando": necesita saber dónde está el usuario (one-shot)
    const handleNotifyMe = async () => {
        if (!selectedBus) return;

        if (demoMode) {
            setShowStopwatch(true);
            setTimeout(() => {
                showToast(`${t('notify_bus_near')} (${t('demo_label')})`, 'info');
            }, 5000);
            return;
        }

        try {
            const permissions = await Geolocation.checkPermissions();
            if (permissions.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    showToast(t('notify_need_location'), 'error');
                    return;
                }
            }
            const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
            setWatcherLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            setNotifyBusId(selectedBus.id);
            setShowStopwatch(true);
        } catch (error) {
            showToast(t('notify_need_location'), 'error');
        }
    };

    const handleArrived = () => {
        setShowStopwatch(false);
        setNotifyBusId(null);
        setShowFeedbackModal(true);
    };

    const submitFeedback = (type: 'safety' | 'time' | 'thanks') => {
        setShowFeedbackModal(false);
        showToast(t('feedback_thanks'), 'success');
    };

    // Buscador: Enter busca la línea y centra el mapa en el primer resultado
    const handleSearch = async () => {
        const query = searchQuery.trim();
        if (!query) return;

        if (demoMode) {
            const match = demo.buses.find(b => b.line.includes(query));
            if (match && mapInstance) {
                mapInstance.setView([match.lat, match.lng], 16);
                setSelectedBus(match);
            } else {
                showToast(t('search_no_results').replace('{line}', query), 'info');
            }
            return;
        }

        const results = await colectivosAPI.buscarPorLinea(query);
        if (results.length > 0 && mapInstance) {
            mapInstance.setView([results[0].lat, results[0].lng], 15);
            setSelectedBus({ ...results[0], arrivalEstimate: computeEta(results[0]) });
        } else {
            showToast(t('search_no_results').replace('{line}', query), 'info');
        }
    };

    const showEmptyState = !demoMode && displayBuses.length === 0 && !selectedBus;

    return (
        <div className="relative w-full h-full bg-obsidian overflow-hidden">

            {/* Real Map */}
            <MapView
                buses={displayBuses}
                reports={displayReports}
                onBusClick={handleBusClick}
                selectedBusId={selectedBus?.id}
                userLocation={userLocation}
                onMapReady={setMapInstance}
                stops={displayStops}
            />

            {/* UI OVERLAYS (Must be z-index > map) */}

            {/* Search Bar & Help Button Container */}
            <div className={`absolute ${demoMode ? 'top-14' : 'top-4'} left-4 right-4 z-20 flex gap-2 pointer-events-auto`}>
                <div className="flex-1 glass-card rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                    <Search className="text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder={t('map_search_placeholder')}
                        className="flex-1 bg-transparent outline-none text-slate-100 font-medium placeholder-slate-400 text-sm"
                    />
                </div>
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-white/10 text-lg font-black"
                >
                    ?
                </button>
            </div>

            {/* Estado vacío honesto: sin bondis activos en este momento */}
            {showEmptyState && (
                <div className="absolute bottom-24 left-4 right-4 z-20 pointer-events-auto animate-in slide-in-from-bottom duration-500">
                    <div className="glass-card border border-slate-700/50 rounded-3xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4)] text-center space-y-4">
                        <div className="w-14 h-14 bg-indigo-500/15 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Bus className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-100">{t('empty_state_title')}</h3>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{t('empty_state_desc')}</p>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={onRequestTraveler}
                                className="w-full bg-gradient-to-r from-luminous-green to-emerald-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                {t('empty_state_cta')}
                            </button>
                            <button
                                onClick={onStartDemo}
                                className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all active:scale-95"
                            >
                                {t('empty_state_demo')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Sheet / Info Card */}
            {selectedBus && !showFeedbackModal && (
                <div className={`absolute bottom-20 left-4 right-4 glass-card rounded-3xl p-5 z-30 animate-in slide-in-from-bottom duration-300 pointer-events-auto border transition-all ${
                    selectedBus.status === BusStatus.VERIFIED ? 'glow-green border-luminous-green/30' :
                    selectedBus.status === BusStatus.PROBLEM ? 'glow-red border-red-500/30' :
                    'border-slate-700/50 shadow-[0_10px_35px_rgba(0,0,0,0.4)]'
                }`}>
                    <button
                        onClick={() => { setSelectedBus(null); setShowStopwatch(false); setNotifyBusId(null); }}
                        className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-slate-300 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={16} />
                    </button>
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
                                {(selectedBus.status === BusStatus.GHOST || selectedBus.status === BusStatus.ESTIMATED) && (
                                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                                        {language === 'es' ? 'Estimado' : 'Estimated'}
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
                        <div className="text-right mr-6">
                            <p className="text-3xl font-black text-indigo-400">
                                {selectedBus.arrivalEstimate !== null ? `${selectedBus.arrivalEstimate}'` : '—'}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                                {selectedBus.arrivalEstimate !== null
                                    ? (language === 'es' ? 'minutos aprox.' : 'approx. minutes')
                                    : (language === 'es' ? 'sin datos' : 'no data')}
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
                                        <p className="text-[9px] text-red-500">{language === 'es' ? 'Te avisamos cuando esté cerca' : 'We will notify you when close'}</p>
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
                    if (mapInstance && refLocation) {
                        mapInstance.setView([refLocation.lat, refLocation.lng], 16);
                    }
                }}
                className={`absolute bottom-24 right-4 p-3 rounded-full shadow-lg transition-all z-20 pointer-events-auto border ${refLocation ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
            >
                <Navigation className="w-6 h-6" />
            </button>

            {/* Help & Reference Guide Modal */}
            {showHelpModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                    <div className="glass-card border border-slate-700/50 w-full max-w-md rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 my-auto pointer-events-auto">
                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-2xl">💡</span>
                            <h3 className="text-xl font-bold text-slate-100">
                                {language === 'es' ? 'Guía de Uso Bondify' : 'Bondify User Guide'}
                            </h3>
                        </div>

                        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                            {/* Color References */}
                            <div className="space-y-2.5">
                                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                                    {language === 'es' ? 'Referencias de Mapa' : 'Map References'}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="w-3.5 h-3.5 bg-luminous-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-200">{language === 'es' ? 'VERIFICADO (En Vivo)' : 'VERIFIED (Live)'}</p>
                                            <p className="text-slate-400 text-[11px] mt-0.5">
                                                {language === 'es'
                                                    ? '¡Ubicación 100% real! Pasajeros activos a bordo comparten su viaje de forma anónima.'
                                                    : '100% real position! Active riders on board are anonymously broadcasting the bus details.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="w-3.5 h-3.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)] mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-200">{language === 'es' ? 'ESTIMADO' : 'ESTIMATED'}</p>
                                            <p className="text-slate-400 text-[11px] mt-0.5">
                                                {language === 'es'
                                                    ? 'Última posición conocida: ya no hay pasajeros compartiendo en vivo.'
                                                    : 'Last known position: no riders are currently sharing live updates.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="w-3.5 h-3.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-200">{language === 'es' ? 'ALERTA / DEMORA / DESVÍO' : 'ALERT / DELAY / DETOUR'}</p>
                                            <p className="text-slate-400 text-[11px] mt-0.5">
                                                {language === 'es'
                                                    ? 'Desvíos de ruta confirmados o demoras inusuales reportadas en vivo por la comunidad.'
                                                    : 'Detour routes or heavy traffic delays reported in real-time by riders.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalle de Dinámica */}
                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                                    {language === 'es' ? '¿Cómo colaboro?' : 'How do I contribute?'}
                                </p>
                                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-3 rounded-xl border border-indigo-500/20 space-y-1.5">
                                    <p className="font-bold text-indigo-300">
                                        {language === 'es' ? '📶 Modo Viajero (' + t('nav_traveling') + ')' : '📶 Passenger Mode (' + t('nav_traveling') + ')'}
                                    </p>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        {language === 'es'
                                            ? 'Al subir al colectivo, tocá el botón central "Esperando" para cambiar a "Viajando" y seleccionar tu línea. Tu teléfono comenzará a emitir pings anónimos, validando la posición para todos los que esperan en la calle.'
                                            : 'Once boarding, tap the central "Waiting" button to toggle "Traveling" and pick your line. Your phone will broadcast secure pings, helping waiting riders down the line.'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-3 rounded-xl border border-orange-500/20 space-y-1.5">
                                    <p className="font-bold text-orange-300">
                                        {language === 'es' ? '⚠️ Reportes en Caliente (Waze)' : '⚠️ Incident Reporting (Waze)'}
                                    </p>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        {language === 'es'
                                            ? 'Usá el botón ⚠️ flotante del mapa para informar piquetes, accidentes o desvíos. La IA de Bondify analizará el incidente para darte consejos inmediatos de desvíos y seguridad.'
                                            : 'Use the floating warning ⚠️ button to report roadblocks, delays, or detours. Bondify AI will analyze the incident to recommend detour alerts and safety tips.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="w-full mt-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                        >
                            {language === 'es' ? 'Entendido' : 'Got it'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
