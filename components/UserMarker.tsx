import React from 'react';
import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';

interface UserMarkerProps {
    location: { lat: number; lng: number };
}

// Custom Blue Dot Icon
const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
            <div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
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
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    color: '#3b82f6',
                    weight: 1,
                    dashArray: '5, 5'
                }}
            />
        </>
    );
};
