import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { BusStop } from '../types';
import { LED } from '../config/designTokens';
import { ICON_SVG } from '../utils/iconSvg';

interface StopMarkerProps {
    stop: BusStop;
}

// Chip de parada: ink + ícono de bondi ámbar
const stopIcon = L.divIcon({
    className: 'bus-stop-marker',
    html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border border-white/10" style="
          background: rgba(16, 16, 19, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        ">
            <div class="w-3.5 h-3.5 rounded-full animate-ping absolute" style="background: ${LED[400]}; opacity: 0.2;"></div>
            <span class="relative z-10 flex items-center justify-center">${ICON_SVG.busFront(14, LED[300])}</span>
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
                    <h4 className="font-bold text-zinc-100 text-sm">{stop.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {stop.lines.map(line => (
                            <span
                                key={line}
                                className="font-mono text-2xs font-bold text-led-300 bg-ink-950 border border-white/10 rounded px-1.5 py-0.5"
                            >
                                {line}
                            </span>
                        ))}
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};
