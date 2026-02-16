import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Reporte {
  _id: string;
  tipo: string;
  linea: string;
  ubicacion: { lat: number; lng: number };
  comentario?: string;
  contadores: {
    yoTambien: number;
    yaNoPasa: number;
    gracias: number;
  };
  createdAt: string;
}

interface ReporteMarkerProps {
  reporte: Reporte;
  onValidar: (reporteId: string, tipo: string) => void;
}

const getReporteIcon = (tipo: string) => {
  const iconos: Record<string, string> = {
    'lleno': '🚌',
    'vacio': '✅',
    'demora': '⏰',
    'accidente': '💥',
    'piquete': '🚧',
    'inseguridad': '⚠️',
    'fantasma': '👻',
    'desvio': '↪️'
  };

  const colores: Record<string, string> = {
    'lleno': '#ef4444',
    'vacio': '#22c55e',
    'demora': '#f97316',
    'accidente': '#dc2626',
    'piquete': '#eab308',
    'inseguridad': '#9333ea',
    'fantasma': '#6b7280',
    'desvio': '#3b82f6'
  };

  const emoji = iconos[tipo] || '📍';
  const color = colores[tipo] || '#3b82f6';

  return L.divIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: ${color};
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        transform: rotate(-45deg);
      ">
        <span style="transform: rotate(45deg);">${emoji}</span>
      </div>
    `,
    className: 'reporte-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

const getTiempoTranscurrido = (fecha: string) => {
  const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos}min`;
  const horas = Math.floor(minutos / 60);
  return `Hace ${horas}h`;
};

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    'lleno': 'Colectivo lleno',
    'vacio': 'Colectivo vacío',
    'demora': 'Gran demora',
    'accidente': 'Accidente',
    'piquete': 'Corte/Piquete',
    'inseguridad': 'Zona insegura',
    'fantasma': 'Bondi fantasma',
    'desvio': 'Desvío'
  };
  return labels[tipo] || tipo;
};

export const ReporteMarker: React.FC<ReporteMarkerProps> = ({ reporte, onValidar }) => {
  return (
    <Marker
      position={[reporte.ubicacion.lat, reporte.ubicacion.lng]}
      icon={getReporteIcon(reporte.tipo)}
      eventHandlers={{
        click: () => {
          // El popup se abre automáticamente
        }
      }}
    >
      <Popup maxWidth={300}>
        <div className="p-2">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">{getReporteIcon(reporte.tipo).match(/>(.*?)</)?.[1] || '📍'}</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{getTipoLabel(reporte.tipo)}</h3>
              <p className="text-xs text-slate-500">Línea {reporte.linea} • {getTiempoTranscurrido(reporte.createdAt)}</p>
            </div>
          </div>

          {reporte.comentario && (
            <p className="text-sm text-slate-700 mb-3 italic">"{reporte.comentario}"</p>
          )}

          {/* Contadores tipo Waze */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              👍 {reporte.contadores.yoTambien} Yo también
            </span>
            {reporte.contadores.gracias > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                💚 {reporte.contadores.gracias}
              </span>
            )}
          </div>

          {/* Botones de validación */}
          <div className="flex gap-2">
            <button
              onClick={() => onValidar(reporte._id, 'yo_tambien')}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors"
            >
              👍 Yo también
            </button>
            <button
              onClick={() => onValidar(reporte._id, 'ya_no')}
              className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              ✓ Ya no
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
