import { useState, useEffect } from 'react';
import { BusEntity, BusStatus, ChaosReport, ReportType, BusStop, DemoAction } from '../types';

interface Location {
    lat: number;
    lng: number;
}

interface UseDemoBusesParams {
    active: boolean;
    userLocation?: Location | null;
    language: string;
    demoAction?: DemoAction | null;
}

// Centro por defecto para el demo: Plaza Italia, CABA
const DEMO_CENTER: Location = { lat: -34.5828, lng: -58.4215 };

function buildDemoData(center: Location, language: string) {
    const es = language === 'es';

    const buses: BusEntity[] = [
        {
            id: 'demo-b1',
            line: '152',
            status: BusStatus.VERIFIED,
            lat: center.lat + 0.001,
            lng: center.lng - 0.001,
            heading: 320,
            passengers: 4,
            lastUpdate: Date.now(),
            destination: es ? 'Centro' : 'Downtown',
            arrivalEstimate: 3
        },
        {
            id: 'demo-b2',
            line: '60',
            status: BusStatus.ESTIMATED,
            lat: center.lat - 0.002,
            lng: center.lng + 0.002,
            heading: 140,
            passengers: 0,
            lastUpdate: Date.now() - 300000,
            destination: 'Terminal',
            arrivalEstimate: 11
        },
        {
            id: 'demo-b3',
            line: '29',
            status: BusStatus.TRAIL,
            lat: center.lat + 0.002,
            lng: center.lng - 0.002,
            heading: 310,
            passengers: 0,
            lastUpdate: Date.now() - 60000,
            destination: es ? 'Estación Norte' : 'North Station',
            arrivalEstimate: 7
        }
    ];

    const reports: ChaosReport[] = [
        {
            id: 'demo-r1',
            type: ReportType.PICKET,
            lat: center.lat + 0.0008,
            lng: center.lng + 0.0008,
            timestamp: Date.now()
        }
    ];

    const stops: BusStop[] = [
        {
            id: 'demo-s1',
            name: es ? 'Parada Plaza Principal' : 'Main Square Station',
            lat: center.lat + 0.0005,
            lng: center.lng - 0.0005,
            lines: ['152', '60']
        },
        {
            id: 'demo-s2',
            name: es ? 'Estación Central' : 'Central Station',
            lat: center.lat - 0.0012,
            lng: center.lng + 0.0012,
            lines: ['152', '29']
        }
    ];

    return { buses, reports, stops };
}

/**
 * Simulación del modo demo (claramente rotulado en la UI con DemoBanner).
 * Genera bondis/reportes/paradas falsos alrededor del usuario (o Plaza Italia)
 * y los mueve suavemente. NADA de esto toca el backend ni Firestore.
 */
export const useDemoBuses = ({ active, userLocation, language, demoAction }: UseDemoBusesParams) => {
    const [buses, setBuses] = useState<BusEntity[]>([]);
    const [reports, setReports] = useState<ChaosReport[]>([]);
    const [stops, setStops] = useState<BusStop[]>([]);

    // Sembrar datos demo al activar (o al cambiar idioma/ubicación base)
    useEffect(() => {
        if (!active) {
            setBuses([]);
            setReports([]);
            setStops([]);
            return;
        }
        const center = userLocation && userLocation.lat ? userLocation : DEMO_CENTER;
        const data = buildDemoData(center, language);
        setBuses(data.buses);
        setReports(data.reports);
        setStops(data.stops);
    }, [active, language]);

    // Movimiento simulado
    useEffect(() => {
        if (!active) return;

        const interval = setInterval(() => {
            setBuses(currentBuses =>
                currentBuses.map(bus => {
                    const dLat = (Math.random() * 0.0001) - 0.00005;
                    const dLng = (Math.random() * 0.0001) - 0.00005;
                    return {
                        ...bus,
                        lat: bus.lat - 0.00001 + dLat,
                        lng: bus.lng - 0.00001 + dLng
                    };
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [active]);

    // Acciones de DemoControls
    useEffect(() => {
        if (!active || !demoAction) return;

        const center = userLocation && userLocation.lat ? userLocation : DEMO_CENTER;

        if (demoAction.type === 'GHOST') {
            const newBus: BusEntity = {
                id: `demo-ghost-${Date.now()}`,
                line: '60',
                status: BusStatus.VERIFIED,
                lat: center.lat + (Math.random() * 0.002 - 0.001),
                lng: center.lng + (Math.random() * 0.002 - 0.001),
                heading: 0,
                passengers: 5,
                lastUpdate: Date.now(),
                destination: 'Constitución',
                arrivalEstimate: 1
            };
            setBuses(prev => [...prev, newBus]);
        } else if (demoAction.type === 'CHAOS') {
            const newReport: ChaosReport = {
                id: `demo-chaos-${Date.now()}`,
                type: ReportType.BROKEN,
                lat: center.lat + (Math.random() * 0.001 - 0.0005),
                lng: center.lng + (Math.random() * 0.001 - 0.0005),
                timestamp: Date.now()
            };
            setReports(prev => [...prev, newReport]);
            // Marcar el primer bondi como con problemas para mostrar el flujo
            setBuses(prev => prev.map((b, i) => i === 0 ? { ...b, status: BusStatus.PROBLEM } : b));
        }
    }, [demoAction, active]);

    return { buses, reports, stops };
};
