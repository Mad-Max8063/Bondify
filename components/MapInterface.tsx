import React, { useState, useEffect } from 'react';
import { BusEntity, BusStatus, UserRole, ChaosReport, ReportType, DemoAction, BusStop } from '../types';
import { MapView } from './MapView';
import { Button } from './Button';
import { colectivosAPI, reportesAPI } from '../services/api';
import { calculateDistance } from '../utils/privacy';
import { Geolocation } from '@capacitor/geolocation';
import { Search, Navigation, Shield, Clock, Users, AlertTriangle, X, Check, Bus, HelpCircle, Lightbulb, RadioTower, ShieldCheck, Timer, Heart } from 'lucide-react';
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

// Frescura del dato: "32 s" / "3 min"
const formatAge = (lastUpdate: number): string => {
    const seg = Math.max(0, Math.round((Date.now() - lastUpdate) / 1000));
    return seg < 60 ? `${seg} s` : `${Math.round(seg / 60)} min`;
};

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
        <div className="relative w-full h-full bg-ink-950 overflow-hidden">

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
            <div className={`absolute ${demoMode ? 'top-14' : 'top-4'} left-4 right-4 z-chrome flex gap-2 pointer-events-auto`}>
                <div className="flex-1 glass-card rounded-card p-3.5 flex items-center gap-3">
                    <Search className="text-zinc-500 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder={t('map_search_placeholder')}
                        className="flex-1 bg-transparent outline-none text-zinc-100 font-medium placeholder-zinc-500 text-sm"
                    />
                </div>
                <button
                    onClick={() => setShowHelpModal(true)}
                    aria-label={t('map_help_title')}
                    className="w-12 h-12 glass-card rounded-card flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/10 active:scale-98 transition-all"
                >
                    <HelpCircle className="w-5 h-5" />
                </button>
            </div>

            {/* Estado vacío honesto: sin bondis activos en este momento */}
            {showEmptyState && (
                <div className="absolute bottom-24 left-4 right-4 z-chrome pointer-events-auto animate-in slide-in-from-bottom duration-500">
                    <div className="glass-card rounded-sheet p-6 text-left space-y-4">
                        <div className="w-12 h-12 bg-led-400/15 border border-led-500/20 rounded-card flex items-center justify-center">
                            <Bus className="w-6 h-6 text-led-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-zinc-100 tracking-tight">{t('empty_state_title')}</h3>
                            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{t('empty_state_desc')}</p>
                        </div>
                        <div className="space-y-2">
                            <Button variant="ok" fullWidth onClick={onRequestTraveler} className="text-sm font-black">
                                <Navigation className="w-4 h-4" />
                                {t('empty_state_cta')}
                            </Button>
                            <Button variant="secondary" fullWidth onClick={onStartDemo} className="text-sm">
                                {t('empty_state_demo')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Sheet / Info Card */}
            {selectedBus && !showFeedbackModal && (
                <div className={`absolute bottom-20 left-4 right-4 glass-card rounded-sheet p-5 z-sheet animate-in slide-in-from-bottom duration-300 pointer-events-auto border transition-all ${
                    selectedBus.status === BusStatus.VERIFIED ? 'border-ok/30' :
                    selectedBus.status === BusStatus.PROBLEM ? 'border-danger/30' :
                    'border-white/10'
                }`}>
                    <button
                        onClick={() => { setSelectedBus(null); setShowStopwatch(false); setNotifyBusId(null); }}
                        className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-zinc-300 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
                                    {language === 'es' ? 'Línea' : 'Line'} <span className="font-mono text-led-400">{selectedBus.line}</span>
                                </h2>
                                {selectedBus.status === BusStatus.VERIFIED && (
                                    <span className="bg-ok/15 text-ok text-2xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                        <Shield size={10} /> {t('map_status_verified')}
                                    </span>
                                )}
                                {selectedBus.status === BusStatus.TRAIL && (
                                    <span className="bg-led-400/15 text-led-300 text-2xs font-bold px-2 py-1 rounded-lg">
                                        {t('map_status_trail')}
                                    </span>
                                )}
                                {(selectedBus.status === BusStatus.GHOST || selectedBus.status === BusStatus.ESTIMATED) && (
                                    <span className="bg-ink-800 text-zinc-400 text-2xs font-bold px-2 py-1 rounded-lg">
                                        {language === 'es' ? 'Estimado' : 'Estimated'}
                                    </span>
                                )}
                                {selectedBus.status === BusStatus.PROBLEM && (
                                    <span className="bg-danger/15 text-danger text-2xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                        <AlertTriangle size={10} /> {t('map_status_problem')}
                                    </span>
                                )}
                            </div>
                            <p className="text-zinc-400 text-sm mt-0.5">
                                {language === 'es' ? `Hacia ${selectedBus.destination}` : `To ${selectedBus.destination}`}
                            </p>
                            <p className="text-2xs text-zinc-500 font-mono mt-0.5">
                                {t('map_updated_ago').replace('{time}', formatAge(selectedBus.lastUpdate))}
                            </p>
                        </div>
                        <div className="text-right mr-6">
                            <p className="text-4xl font-mono font-bold text-led-400 leading-none">
                                {selectedBus.arrivalEstimate !== null ? `${selectedBus.arrivalEstimate}'` : '—'}
                            </p>
                            <p className="text-2xs text-zinc-500 uppercase font-bold tracking-wider mt-1">
                                {selectedBus.arrivalEstimate !== null
                                    ? (language === 'es' ? 'minutos aprox.' : 'approx. minutes')
                                    : (language === 'es' ? 'sin datos' : 'no data')}
                            </p>
                        </div>
                    </div>

                    {selectedBus.status === BusStatus.VERIFIED && (
                        <div className="bg-ok/10 border border-ok/10 rounded-field p-3 mb-4 flex items-center gap-3">
                            <div className="bg-ok/20 p-2 rounded-lg">
                                <Users className="w-4 h-4 text-ok" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-300 font-medium">
                                    <strong className="text-ok">
                                        {selectedBus.passengers > 0
                                            ? (language === 'es' ? `${selectedBus.passengers} a bordo` : `${selectedBus.passengers} on board`)
                                            : (language === 'es' ? 'Usuarios a bordo' : 'Users on board')}
                                    </strong> {language === 'es' ? 'compartiendo ubicación en vivo.' : 'sharing live location details.'}
                                </p>
                                <p className="text-2xs text-zinc-500 mt-1">{t('map_safety_note')}</p>
                            </div>
                        </div>
                    )}

                    {selectedBus.status === BusStatus.TRAIL && (
                        <div className="bg-led-400/10 border border-led-500/15 rounded-field p-3 mb-4 flex items-center gap-3">
                            <div className="bg-led-400/20 p-2 rounded-lg">
                                <Shield className="w-4 h-4 text-led-400" />
                            </div>
                            <p className="text-xs text-zinc-300 font-medium">
                                {t('map_trail_desc')}
                            </p>
                        </div>
                    )}

                    {selectedBus.status === BusStatus.PROBLEM && (
                        <div className="bg-danger/10 border border-danger/15 rounded-field p-3 mb-4 flex items-center gap-3">
                            <div className="bg-danger/20 p-2 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-danger" />
                            </div>
                            <p className="text-xs text-zinc-300 font-medium">
                                <strong className="text-danger">{language === 'es' ? '¡Cuidado!' : 'Warning!'}</strong> {language === 'es' ? 'Reportaron desperfectos o desvíos en esta unidad.' : 'Active delays or detour routes reported on this bus.'}
                            </p>
                        </div>
                    )}

                    {showStopwatch ? (
                        <div className="flex gap-2">
                            <div className="flex-1 bg-led-400/10 border border-led-500/20 rounded-field p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-led-400 w-5 h-5 animate-pulse" />
                                    <div>
                                        <p className="font-bold text-led-300 text-sm">{language === 'es' ? 'Esperando...' : 'Waiting...'}</p>
                                        <p className="text-2xs text-zinc-500">{language === 'es' ? 'Te avisamos cuando esté cerca' : 'We will notify you when close'}</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ok" onClick={handleArrived} className="flex-1">
                                <Check className="w-4 h-4" />
                                {language === 'es' ? '¡Ya subí!' : 'I boarded!'}
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
                <div className="absolute inset-0 z-overlay flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm rounded-sheet p-6 space-y-4 animate-in slide-in-from-bottom pointer-events-auto">
                        <div className="text-left">
                            <div className="w-12 h-12 bg-ok/15 rounded-card flex items-center justify-center mb-3">
                                <Check className="w-6 h-6 text-ok" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-100 tracking-tight">{language === 'es' ? '¡Llegaste!' : 'Arrived!'}</h3>
                            <p className="text-zinc-400 text-sm mt-1">{language === 'es' ? '¿Cómo estuvo la espera?' : 'How was the wait?'}</p>
                        </div>

                        <div className="divide-y divide-white/5 border-y border-white/5">
                            <button onClick={() => submitFeedback('safety')} className="w-full py-3.5 px-1 text-zinc-200 font-bold flex items-center gap-3 hover:bg-white/5 transition-all active:scale-98 text-sm">
                                <ShieldCheck className="w-5 h-5 text-led-400 shrink-0" />
                                {language === 'es' ? '¡Esperé seguro!' : 'I felt safe!'}
                            </button>
                            <button onClick={() => submitFeedback('time')} className="w-full py-3.5 px-1 text-zinc-200 font-bold flex items-center gap-3 hover:bg-white/5 transition-all active:scale-98 text-sm">
                                <Timer className="w-5 h-5 text-ok shrink-0" />
                                {language === 'es' ? '¡Gané tiempo!' : 'Saved time!'}
                            </button>
                            <button onClick={() => submitFeedback('thanks')} className="w-full py-3.5 px-1 text-zinc-200 font-bold flex items-center gap-3 hover:bg-white/5 transition-all active:scale-98 text-sm">
                                <Heart className="w-5 h-5 text-zinc-400 shrink-0" />
                                {language === 'es' ? '¡Gracias!' : 'Thanks!'}
                            </button>
                        </div>

                        <button onClick={() => setShowFeedbackModal(false)} className="w-full py-2 text-zinc-500 hover:text-zinc-400 text-sm font-medium transition-colors">
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
                className={`absolute bottom-24 right-4 p-3 rounded-card shadow-fab transition-all z-chrome pointer-events-auto border active:scale-98 ${refLocation ? 'bg-led-500 border-led-400/50 text-ink-950' : 'bg-ink-800 border-white/10 text-zinc-600'}`}
            >
                <Navigation className="w-6 h-6" />
            </button>

            {/* Help & Reference Guide Modal */}
            {showHelpModal && (
                <div className="absolute inset-0 z-overlay flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                    <div className="glass-card w-full max-w-md rounded-sheet p-6 relative animate-in zoom-in-95 my-auto pointer-events-auto">
                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-200 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-led-400/15 rounded-field flex items-center justify-center shrink-0">
                                <Lightbulb className="w-5 h-5 text-led-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
                                {language === 'es' ? 'Guía de Uso Bondify' : 'Bondify User Guide'}
                            </h3>
                        </div>

                        <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
                            {/* Color References */}
                            <div className="space-y-2.5">
                                <p className="font-bold text-2xs text-zinc-400 uppercase tracking-wider">
                                    {language === 'es' ? 'Referencias de Mapa' : 'Map References'}
                                </p>
                                <div className="divide-y divide-white/5">
                                    <div className="flex items-start gap-3 py-3">
                                        <div className="w-3.5 h-3.5 bg-ok rounded-full mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-bold text-zinc-200">{language === 'es' ? 'VERIFICADO (En Vivo)' : 'VERIFIED (Live)'}</p>
                                            <p className="text-zinc-400 text-[11px] mt-0.5">
                                                {language === 'es'
                                                    ? 'Posición compartida en vivo por pasajeros anónimos y validada por el servidor (trayectoria y velocidad plausibles).'
                                                    : 'Live position shared by anonymous riders, server-validated (plausible trajectory and speed).'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 py-3">
                                        <div className="w-3.5 h-3.5 bg-zinc-400 rounded-full mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-bold text-zinc-200">{language === 'es' ? 'ESTIMADO' : 'ESTIMATED'}</p>
                                            <p className="text-zinc-400 text-[11px] mt-0.5">
                                                {language === 'es'
                                                    ? 'Última posición conocida: ya no hay pasajeros compartiendo en vivo.'
                                                    : 'Last known position: no riders are currently sharing live updates.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 py-3">
                                        <div className="w-3.5 h-3.5 bg-danger rounded-full mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-bold text-zinc-200">{language === 'es' ? 'ALERTA / DEMORA / DESVÍO' : 'ALERT / DELAY / DETOUR'}</p>
                                            <p className="text-zinc-400 text-[11px] mt-0.5">
                                                {language === 'es'
                                                    ? 'Desvíos de ruta confirmados o demoras inusuales reportadas en vivo por la comunidad.'
                                                    : 'Detour routes or heavy traffic delays reported in real-time by riders.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalle de Dinámica */}
                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <p className="font-bold text-2xs text-zinc-400 uppercase tracking-wider">
                                    {language === 'es' ? '¿Cómo colaboro?' : 'How do I contribute?'}
                                </p>
                                <div className="bg-ink-800 p-3 rounded-field border border-white/5 space-y-1.5">
                                    <p className="font-bold text-ok flex items-center gap-1.5">
                                        <RadioTower className="w-3.5 h-3.5 shrink-0" />
                                        {language === 'es' ? 'Modo Viajero (' + t('nav_traveling') + ')' : 'Passenger Mode (' + t('nav_traveling') + ')'}
                                    </p>
                                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                                        {language === 'es'
                                            ? 'Al subir al colectivo, tocá el botón central "Esperando" para cambiar a "Viajando" y seleccionar tu línea. Tu teléfono comenzará a emitir pings anónimos, validando la posición para todos los que esperan en la calle.'
                                            : 'Once boarding, tap the central "Waiting" button to toggle "Traveling" and pick your line. Your phone will broadcast secure pings, helping waiting riders down the line.'}
                                    </p>
                                </div>
                                <div className="bg-ink-800 p-3 rounded-field border border-white/5 space-y-1.5">
                                    <p className="font-bold text-led-300 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                        {language === 'es' ? 'Reportes en Caliente (Waze)' : 'Incident Reporting (Waze)'}
                                    </p>
                                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                                        {language === 'es'
                                            ? 'Usá el botón flotante de alertas del mapa para informar piquetes, accidentes o desvíos. La IA de Bondify analizará el incidente para darte consejos inmediatos de desvíos y seguridad.'
                                            : 'Use the floating alert button to report roadblocks, delays, or detours. Bondify AI will analyze the incident to recommend detour alerts and safety tips.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="w-full mt-5 py-3 bg-ink-800 hover:bg-ink-700 border border-white/10 text-zinc-200 font-bold rounded-field text-xs transition-colors active:scale-98"
                        >
                            {language === 'es' ? 'Entendido' : 'Got it'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
