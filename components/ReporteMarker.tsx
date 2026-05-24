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
    'vacio': '#10B981',
    'demora': '#f59e0b',
    'accidente': '#ef4444',
    'piquete': '#f59e0b',
    'inseguridad': '#8b5cf6',
    'fantasma': '#64748b',
    'desvio': '#3b82f6'
  };

  const emoji = iconos[tipo] || '📍';
  const color = colores[tipo] || '#3b82f6';

  return L.divIcon({
    html: `
      <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border transition-all hover:scale-105" style="
        background: rgba(30, 41, 59, 0.75);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 0 15px ${color}33;
        border-color: ${color}55;
      ">
        <span class="filter drop-shadow-[0_2px_8px_${color}aa]">${emoji}</span>
      </div>
    `,
    className: 'reporte-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
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

const EMOJIS: Record<string, string> = {
  'lleno': '🚌',
  'vacio': '✅',
  'demora': '⏰',
  'accidente': '💥',
  'piquete': '🚧',
  'inseguridad': '⚠️',
  'fantasma': '👻',
  'desvio': '↪️'
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
        <div className="p-3 bg-obsidian-dark text-slate-100 rounded-xl space-y-3.5 shadow-2xl border border-slate-700/30">
          <div className="flex items-start gap-3">
            <div className="text-3xl filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]">{EMOJIS[reporte.tipo] || '📍'}</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-sm leading-tight">{getTipoLabel(reporte.tipo)}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Línea {reporte.linea} • {getTiempoTranscurrido(reporte.createdAt)}</p>
            </div>
          </div>

          {reporte.comentario && (
            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/50 pl-2">"{reporte.comentario}"</p>
          )}

          {/* Contadores tipo Waze */}
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/10 shadow-sm">
              👍 {reporte.contadores.yoTambien} Yo también
            </span>
            {reporte.contadores.gracias > 0 && (
              <span className="px-2 py-1 bg-luminous-green/20 text-luminous-green rounded-lg border border-luminous-green/10 shadow-sm">
                💚 {reporte.contadores.gracias}
              </span>
            )}
          </div>

          {/* Botones de validación */}
          <div className="flex gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => onValidar(reporte._id, 'yo_tambien')}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-lg text-[10px] font-black tracking-wider transition-all active:scale-95 border border-white/10 shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
            >
              👍 Yo también
            </button>
            <button
              onClick={() => onValidar(reporte._id, 'ya_no')}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-[10px] font-black tracking-wider transition-all active:scale-95 border border-white/5"
            >
              ✓ Ya no
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
