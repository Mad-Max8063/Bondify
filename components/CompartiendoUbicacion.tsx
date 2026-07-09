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
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setSegundos(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatearTiempo = (seg: number) => {
    const mins = Math.floor(seg / 60);
    const secs = seg % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-banner animate-in slide-in-from-top w-[calc(100%-2rem)] max-w-sm">
      <div className="glass-card rounded-sheet p-4 border-ok/30">
        <div className="flex items-center justify-between gap-4">
          {/* Indicador animado */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-ok/15 rounded-full flex items-center justify-center border border-ok/30">
                <Navigation className="w-6 h-6 text-ok" />
              </div>
              <div className="absolute inset-0 w-12 h-12 bg-ok rounded-full animate-ping opacity-20" />
            </div>

            <div className="text-zinc-100">
              <p className="font-bold text-sm md:text-base leading-tight">{t('geo_sharing_active')}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <div className="w-2 h-2 bg-ok rounded-full animate-pulse-slow" />
                <span>Línea <span className="font-mono text-led-400">{linea}</span> {ramal && `(${ramal})`}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-ok text-2xs font-bold bg-ok/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Users className="w-2.5 h-2.5" />
              <span>{t('geo_sharing_verified')}</span>
            </div>
            <span className="text-zinc-400 text-xs font-mono font-bold">{formatearTiempo(segundos)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onDetener}
            className="flex-1 bg-ink-800 hover:bg-ink-700 text-zinc-100 py-3 rounded-field font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98 border border-white/10"
          >
            <StopCircle className="w-4 h-4" />
            {t('geo_sharing_get_off')}
          </button>

          <button
            onClick={onPanic}
            className="flex-[0.5] bg-danger-dim hover:brightness-110 text-white py-3 rounded-field font-black text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            {t('geo_sharing_panic')}
          </button>
        </div>

        {/* Tip */}
        <p className="text-2xs text-zinc-500 text-center mt-2.5 font-semibold">
          {t('geo_sharing_desc')}
        </p>
      </div>
    </div>
  );
};
