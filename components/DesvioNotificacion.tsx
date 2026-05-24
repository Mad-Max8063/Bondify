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
    <div className="fixed top-4 left-4 right-4 z-[9998] animate-in slide-in-from-top duration-500 w-[calc(100%-2rem)] max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-blue-600/95 to-indigo-700/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 text-white border border-white/10">
        <div className="flex items-start gap-3">
          {/* Icono pulsante */}
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse flex-shrink-0 border border-white/10">
            <Navigation className="w-6 h-6" />
          </div>
          
          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell className="w-3.5 h-3.5 text-blue-200" />
              <h4 className="font-bold text-base leading-tight">{t('notif_detour_confirmed_title')}</h4>
            </div>
            <p className="text-xs text-blue-100 leading-normal">
              {t('notif_detour_confirmed_desc')
                .replace('{linea}', linea)
                .concat(ramal ? ` (${ramal})` : '')}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-blue-200/90">
              <MapPin className="w-3 h-3 text-blue-300" />
              <span>{t('notif_detour_verified_by')}</span>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors active:scale-95 border border-white/5"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Barra de progreso para auto-cierre */}
        <div className="mt-3.5 w-full bg-white/20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-full"
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
