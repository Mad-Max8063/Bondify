import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { ChaosReport } from '../types';
import { createChaosIcon } from '../utils/leafletIcons';

interface ChaosMarkerProps {
  report: ChaosReport;
}

const EMOJI_OPTIONS = ['👍', '😢', '😡', '🫡'];

export const ChaosMarker: React.FC<ChaosMarkerProps> = ({ report }) => {
  const [reactions, setReactions] = React.useState<{ [key: string]: number }>(report.reactions || {});

  const handleReact = (emoji: string) => {
    setReactions(prev => {
      const currentCount = prev[emoji] || 0;
      return {
        ...prev,
        [emoji]: currentCount + 1
      };
    });
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'PICKET': return 'Piquete / Corte';
      case 'ACCIDENT': return 'Accidente';
      case 'BROKEN': return 'Bondi Roto';
      case 'STATION_CLOSED': return 'Estación Cerrada';
      case 'DEVIATION': return 'Desvío de Recorrido';
      default: return 'Incidente';
    }
  };

  return (
    <Marker
      position={[report.lat, report.lng]}
      icon={createChaosIcon(report)}
      zIndexOffset={2000}
    >
      <Popup className="rounded-xl overflow-hidden">
        <div className="p-1 min-w-[150px]">
          <h4 className="font-bold text-slate-800 text-sm mb-1">{getTitle(report.type)}</h4>
          <p className="text-xs text-slate-500 mb-3">
            Reportado hace {Math.floor((Date.now() - report.timestamp) / 60000)} min
          </p>

          <div className="flex gap-1 justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="flex flex-col items-center hover:scale-110 transition-transform active:scale-90"
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-[10px] font-bold text-slate-400">
                  {reactions[emoji] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};