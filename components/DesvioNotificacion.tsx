import React, { useState, useEffect } from 'react';
import { Navigation, X, MapPin, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DesvioNotificacionProps {
  linea: string;
  ramal?: string;
  onClose: () => void;
}

export const DesvioNotificacion: React.FC<DesvioNotificacionProps> = ({
  linea,
  ramal,
  onClose
}) => {
  const [visible, setVisible] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Auto cerrar después de 10 segundos
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Esperar animación
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-alert animate-in slide-in-from-top duration-500 w-[calc(100%-2rem)] max-w-sm mx-auto">
      <div className="glass-card rounded-sheet p-4 border-led-500/40">
        <div className="flex items-start gap-3">
          {/* Icono pulsante */}
          <div className="w-12 h-12 bg-led-400/15 rounded-card flex items-center justify-center animate-pulse-slow shrink-0 border border-led-500/30">
            <Navigation className="w-6 h-6 text-led-400" />
          </div>

          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell className="w-3.5 h-3.5 text-led-300" />
              <h4 className="font-bold text-base leading-tight text-zinc-100">{t('notif_detour_confirmed_title')}</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              {t('notif_detour_confirmed_desc')
                .replace('{linea}', linea)
                .concat(ramal ? ` (${ramal})` : '')}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 text-2xs font-bold text-zinc-500">
              <MapPin className="w-3 h-3 text-led-300" />
              <span>{t('notif_detour_verified_by')}</span>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors active:scale-95 border border-white/10"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Barra de progreso para auto-cierre */}
        <div className="mt-3.5 w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-led-400/70 rounded-full"
            style={{
              animation: 'shrink 10s linear forwards',
              width: '100%'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
