import React, { useState, useEffect } from 'react';
import { Navigation, X, MapPin, Bell } from 'lucide-react';

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
    <div className="fixed top-4 left-4 right-4 z-[9998] animate-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          {/* Icono pulsante */}
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse flex-shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          
          {/* Contenido */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4" />
              <h4 className="font-bold text-lg">¡Alerta de Desvío Confirmada!</h4>
            </div>
            <p className="text-sm text-blue-100">
              La <span className="font-bold">Línea {linea}</span>{ramal && ` (${ramal})`} se está desviando de su recorrido habitual.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-blue-200">
              <MapPin className="w-3 h-3" />
              <span>Verificado por 3 pasajeros a bordo</span>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de progreso para auto-cierre */}
        <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-full animate-[shrink_10s_linear_forwards]"
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
