import React, { useState, useEffect } from 'react';
import { Navigation, StopCircle, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

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
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-top w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-xl rounded-3xl shadow-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between gap-4">
          {/* Indicador animado */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center transition-transform duration-500 ${pulso ? 'scale-110' : 'scale-100'}`}>
                <Navigation className="w-6 h-6 text-green-600" />
              </div>
              {/* Pulso animado */}
              <div className="absolute inset-0 w-12 h-12 bg-white rounded-full animate-ping opacity-25"></div>
            </div>

            <div className="text-white">
              <p className="font-bold text-sm md:text-base leading-tight">{t('geo_sharing_active')}</p>
              <div className="flex items-center gap-2 text-xs text-green-100 mt-0.5">
                <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                <span>Línea {linea} {ramal && `(${ramal})`}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 text-white text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Users className="w-2.5 h-2.5" />
              <span>{t('geo_sharing_verified')}</span>
            </div>
            <span className="text-green-100 text-xs font-mono font-bold">{formatearTiempo(segundos)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onDetener}
            className="flex-1 bg-white/10 hover:bg-white/20 text-slate-100 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98 border border-white/5"
          >
            <StopCircle className="w-4 h-4" />
            {t('geo_sharing_get_off')}
          </button>

          <button
            onClick={onPanic}
            className="flex-[0.5] bg-red-500/80 hover:bg-red-600 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors animate-pulse active:scale-98"
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            {t('geo_sharing_panic')}
          </button>
        </div>

        {/* Tip */}
        <p className="text-[9px] text-green-100/80 text-center mt-2.5 font-semibold">
          {t('geo_sharing_desc')}
        </p>
      </div>
    </div>
  );
};
