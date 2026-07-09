import React from 'react';
import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { SEMANTIC } from '../config/designTokens';

interface UserMarkerProps {
    location: { lat: number; lng: number };
}

// Punto azul: convención universal de "vos estás acá"
const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 rounded-full opacity-30 animate-ping" style="background: ${SEMANTIC.gps}"></div>
            <div class="relative w-4 h-4 rounded-full border-2 border-ink-950 shadow-lg" style="background: ${SEMANTIC.gps}"></div>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

export const UserMarker: React.FC<UserMarkerProps> = ({ location }) => {
    return (
        <>
            <Marker position={[location.lat, location.lng]} icon={userIcon} />
            <Circle
                center={[location.lat, location.lng]}
                radius={30}
                pathOptions={{
                    fillColor: SEMANTIC.gps,
                    fillOpacity: 0.1,
                    color: SEMANTIC.gps,
                    weight: 1,
                    dashArray: '5, 5'
                }}
            />
        </>
    );
};
