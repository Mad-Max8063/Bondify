import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, StopCircle, Users } from 'lucide-react';

interface CompartiendoUbicacionProps {
  linea: string;
  ramal: string;
  onDetener: () => void;
  usuariosViendote: number;
  onPanic?: () => void;
}

export const CompartiendoUbicacion: React.FC<CompartiendoUbicacionProps> = ({
  linea,
  ramal,
  onDetener,
  usuariosViendote,
  onPanic
}) => {
  const [segundos, setSegundos] = useState(0);
  const [pulso, setPulso] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSegundos(s => s + 1);
      setPulso(p => !p);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatearTiempo = (seg: number) => {
    const mins = Math.floor(seg / 60);
    const secs = seg % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-top">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-4 min-w-[320px]">
        <div className="flex items-center justify-between gap-4">
          {/* Indicador animado */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center transition-transform ${pulso ? 'scale-110' : 'scale-100'}`}>
                <Navigation className="w-6 h-6 text-green-600" />
              </div>
              {/* Pulso animado */}
              <div className="absolute inset-0 w-12 h-12 bg-white rounded-full animate-ping opacity-30"></div>
            </div>

            <div className="text-white">
              <p className="font-bold text-lg">Compartiendo ubicación</p>
              <div className="flex items-center gap-2 text-sm text-green-100">
                <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                <span>Línea {linea} {ramal && `(${ramal})`}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-white text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              <Users className="w-3 h-3" />
              <span>Verificado</span>
            </div>
            <span className="text-green-100 text-xs font-mono">{formatearTiempo(segundos)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onDetener}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <StopCircle className="w-4 h-4" />
            Bajarme
          </button>

          <button
            onClick={onPanic}
            className="flex-[0.5] bg-red-500/80 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors animate-pulse"
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            PÁNICO
          </button>
        </div>

        {/* Tip */}
        <p className="text-[10px] text-green-100 text-center mt-2 font-medium opacity-80">
          📍 Tu ubicación se comparte con un margen de 50m para tu privacidad.
        </p>
      </div>
    </div>
  );
};
