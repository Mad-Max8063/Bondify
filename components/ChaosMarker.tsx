import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { ThumbsUp, Frown, Angry, HeartHandshake } from 'lucide-react';
import { ChaosReport } from '../types';
import { createChaosIcon } from '../utils/leafletIcons';

interface ChaosMarkerProps {
  report: ChaosReport;
}

// Las keys se conservan (son las que pueden venir en report.reactions)
const REACTION_OPTIONS = [
  { key: '👍', Icon: ThumbsUp, label: 'Gracias' },
  { key: '😢', Icon: Frown, label: 'Qué bajón' },
  { key: '😡', Icon: Angry, label: 'Bronca' },
  { key: '🫡', Icon: HeartHandshake, label: 'Aguante' },
];

export const ChaosMarker: React.FC<ChaosMarkerProps> = ({ report }) => {
  const [reactions, setReactions] = React.useState<{ [key: string]: number }>(report.reactions || {});

  const handleReact = (key: string) => {
    setReactions(prev => {
      const currentCount = prev[key] || 0;
      return {
        ...prev,
        [key]: currentCount + 1
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
          <h4 className="font-bold text-zinc-100 text-sm mb-1">{getTitle(report.type)}</h4>
          <p className="text-xs text-zinc-500 mb-3 font-mono">
            hace {Math.floor((Date.now() - report.timestamp) / 60000)} min
          </p>

          <div className="flex gap-1 justify-between bg-ink-800 p-2 rounded-lg border border-white/5">
            {REACTION_OPTIONS.map(({ key, Icon, label }) => (
              <button
                key={key}
                onClick={() => handleReact(key)}
                aria-label={label}
                className="flex flex-col items-center gap-0.5 hover:scale-110 transition-transform active:scale-90 text-zinc-400 hover:text-led-300"
              >
                <Icon size={16} strokeWidth={2} />
                <span className="text-2xs font-bold font-mono text-zinc-500">
                  {reactions[key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
