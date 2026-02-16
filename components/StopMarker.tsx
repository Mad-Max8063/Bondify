import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { BusStop } from '../types';

interface StopMarkerProps {
    stop: BusStop;
}

// Custom Bus Stop Icon
const stopIcon = L.divIcon({
    className: 'bus-stop-marker',
    html: `
        <div class="flex items-center justify-center w-6 h-6 bg-white border-2 border-slate-400 rounded-full shadow-md">
            <span class="text-[10px] font-bold text-slate-600">🚏</span>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

export const StopMarker: React.FC<StopMarkerProps> = ({ stop }) => {
    return (
        <Marker position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup className="bus-stop-popup">
                <div className="p-1">
                    <h4 className="font-bold text-slate-800 text-sm">{stop.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Líneas: {stop.lines.join(', ')}</p>
                </div>
            </Popup>
        </Marker>
    );
};
