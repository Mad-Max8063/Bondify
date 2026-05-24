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
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]" style="
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        ">
            <!-- Glowing blue core animation -->
            <div class="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-ping absolute opacity-30"></div>
            <!-- Stop Icon -->
            <span class="text-xs text-indigo-300 relative z-10">🚏</span>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
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
