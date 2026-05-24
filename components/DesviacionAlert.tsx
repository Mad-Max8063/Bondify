import React, { useState } from 'react';
import { AlertTriangle, MapPin, LogOut, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { language } = useLanguage();
  const [pulsando, setPulsando] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPulsando(p => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-3xl w-full max-w-md shadow-[0_15px_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95">
        {/* Header con alerta */}
        <div className="bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-xl p-6 text-white rounded-t-3xl relative overflow-hidden border-b border-white/10">
          {/* Pulso de fondo */}
          <div 
            className={`absolute inset-0 bg-white transition-opacity duration-1000 ${
              pulsando ? 'opacity-10' : 'opacity-0'
            }`}
          />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse border border-white/10">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {language === 'es' ? '¡Desviación Detectada!' : 'Detour Detected!'}
              </h2>
              <p className="text-sm text-orange-200/90 font-medium">
                {language === 'es' ? `Línea ${linea}` : `Line ${linea}`} {ramal && `(${ramal})`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Explicación */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <p className="text-orange-300 font-bold mb-2 text-sm">
              {language === 'es' ? '📍 Notamos que te desviaste de tu ruta habitual' : '📍 Detour detected from your usual route'}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'es' ? 'Esto puede ocurrir por diferentes motivos:' : 'This can happen due to several reasons:'}
            </p>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 ml-2">
              <li>• {language === 'es' ? 'Ya te bajaste del colectivo' : 'You already got off the bus'}</li>
              <li>• {language === 'es' ? 'El colectivo tomó un desvío de emergencia' : 'The bus took an emergency detour'}</li>
              <li>• {language === 'es' ? 'Estás en otra ruta diferente' : 'You are on a different route'}</li>
            </ul>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'es' ? '¿Qué está pasando?' : 'What is happening?'}
            </p>
            
            {/* Opción 1: Me bajé */}
            <button
              onClick={onConfirmarBajada}
              className="w-full p-4 rounded-2xl border border-luminous-green/20 bg-luminous-green/10 hover:bg-luminous-green/20 transition-all flex items-center gap-4 group active:scale-98"
            >
              <div className="w-12 h-12 bg-luminous-green rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-luminous-green text-sm">
                  {language === 'es' ? 'Ya me bajé del colectivo' : 'I already got off the bus'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'es' ? 'Dejaré de compartir mi ubicación' : 'Stop sharing my location'}
                </p>
              </div>
            </button>

            {/* Opción 2: Hay desvío */}
            <button
              onClick={onConfirmarDesvio}
              className="w-full p-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 transition-all flex items-center gap-4 group active:scale-98"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-luminous-amber text-sm">
                  {language === 'es' ? 'Hay un desvío en la ruta' : 'There is a detour on the route'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'es' ? 'Continuaré compartiendo la nueva ruta' : 'Keep sharing the new detoured path'}
                </p>
              </div>
            </button>

            {/* Opción 3: Sigo viajando normal */}
            <button
              onClick={onSeguirViajando}
              className="w-full p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all flex items-center gap-4 group active:scale-98"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-indigo-400 text-sm">
                  {language === 'es' ? 'Sigo viajando (falsa alarma)' : 'Still riding (false alarm)'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'es' ? 'Actualizar y aprender mi ruta habitual' : 'Update and learn my usual route'}
                </p>
              </div>
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-[10px] text-slate-400 leading-relaxed shadow-inner">
            <p className="font-bold mb-1 text-slate-200">
              {language === 'es' ? '💡 ¿Por qué preguntamos?' : '💡 Why are we asking?'}
            </p>
            <p>
              {language === 'es'
                ? 'Si sos el único usuario compartiendo ubicación y te bajaste, estimaremos el recorrido en gris (estimado) para que otros pasajeros tengan una estimación confiable sin datos desactualizados.'
                : 'If you are the only rider sharing GPS and you get off, we will fallback to scheduled times in grey (estimated) so others get accurate predictions without stale data.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};