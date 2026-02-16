import React, { useState } from 'react';
import { AlertTriangle, MapPin, LogOut, Navigation } from 'lucide-react';

interface DesviacionAlertProps {
  linea: string;
  ramal: string;
  onConfirmarBajada: () => void;
  onConfirmarDesvio: () => void;
  onSeguirViajando: () => void;
}

export const DesviacionAlert: React.FC<DesviacionAlertProps> = ({ 
  linea, 
  ramal,
  onConfirmarBajada,
  onConfirmarDesvio,
  onSeguirViajando
}) => {
  const [pulsando, setPulsando] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPulsando(p => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        {/* Header con alerta */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white rounded-t-3xl relative overflow-hidden">
          {/* Pulso de fondo */}
          <div 
            className={`absolute inset-0 bg-white transition-opacity duration-1000 ${
              pulsando ? 'opacity-10' : 'opacity-0'
            }`}
          />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">¡Desviación Detectada!</h2>
              <p className="text-sm text-orange-100">Línea {linea} {ramal && `(${ramal})`}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Explicación */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <p className="text-slate-900 font-medium mb-2">
              📍 Notamos que te desviaste de tu ruta habitual
            </p>
            <p className="text-sm text-slate-600">
              Esto puede ser porque:
            </p>
            <ul className="text-sm text-slate-600 mt-2 space-y-1 ml-4">
              <li>• Ya te bajaste del colectivo</li>
              <li>• El colectivo tomó un desvío</li>
              <li>• Estás en otra ruta diferente</li>
            </ul>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">¿Qué está pasando?</p>
            
            {/* Opción 1: Me bajé */}
            <button
              onClick={onConfirmarBajada}
              className="w-full p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-green-900">Ya me bajé del colectivo</p>
                <p className="text-xs text-green-700">Dejaré de compartir mi ubicación</p>
              </div>
            </button>

            {/* Opción 2: Hay desvío */}
            <button
              onClick={onConfirmarDesvio}
              className="w-full p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-orange-900">Hay un desvío en la ruta</p>
                <p className="text-xs text-orange-700">Continuaré compartiendo ubicación</p>
              </div>
            </button>

            {/* Opción 3: Sigo viajando normal */}
            <button
              onClick={onSeguirViajando}
              className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-blue-900">Sigo viajando (falsa alarma)</p>
                <p className="text-xs text-blue-700">Actualizar mi ruta habitual</p>
              </div>
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-600">
            <p className="font-bold mb-1">💡 ¿Por qué preguntamos?</p>
            <p>
              Si sos el único usuario compartiendo ubicación y te bajaste, 
              mostraremos el colectivo en <span className="font-bold text-slate-700">gris (estimado)</span> para 
              que otros usuarios sepan que viene, pero con tiempo aproximado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};