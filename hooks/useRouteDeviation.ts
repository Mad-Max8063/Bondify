import { useState } from 'react';

interface Location {
    lat: number;
    lng: number;
}

export const useRouteDeviation = () => {
    const [showDesviacionAlert, setShowDesviacionAlert] = useState(false);
    const [rutinaUsuario, setRutinaUsuario] = useState<Location[]>([]);

    // Función para calcular distancia entre dos puntos (en metros)
    const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371e3; // Radio de la Tierra en metros
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distancia en metros
    };

    // Verificar si hay desviación de la ruta
    const verificarDesviacion = (lat: number, lng: number) => {
        // Si no hay rutina cargada, no hay desviación
        if (rutinaUsuario.length === 0) return false;

        // Calcular distancia mínima a cualquier punto de la rutina
        const distanciaMinima = Math.min(
            ...rutinaUsuario.map((punto) => calcularDistancia(lat, lng, punto.lat, punto.lng))
        );

        // Si está a más de 500 metros de la ruta habitual, es desviación
        return distanciaMinima > 500;
    };

    return {
        showDesviacionAlert,
        setShowDesviacionAlert,
        rutinaUsuario,
        setRutinaUsuario,
        verificarDesviacion,
        calcularDistancia,
    };
};
