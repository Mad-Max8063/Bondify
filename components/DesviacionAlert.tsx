import React from 'react';
import { AlertTriangle, MapPin, LogOut, Navigation, Lightbulb } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-alert flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card rounded-sheet w-full max-w-md animate-in zoom-in-95">
        {/* Header con alerta */}
        <div className="bg-ink-900/95 backdrop-blur-xl p-6 rounded-t-sheet border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-led-400/15 rounded-full flex items-center justify-center border border-led-500/30 animate-pulse-slow">
              <AlertTriangle className="w-8 h-8 text-led-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                {language === 'es' ? '¡Desviación Detectada!' : 'Detour Detected!'}
              </h2>
              <p className="text-sm text-zinc-400 font-medium">
                {language === 'es' ? 'Línea' : 'Line'} <span className="font-mono text-led-300">{linea}</span> {ramal && `(${ramal})`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Explicación */}
          <div className="bg-led-400/10 border border-led-500/20 rounded-card p-4">
            <p className="text-led-300 font-bold mb-2 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              {language === 'es' ? 'Notamos que te desviaste de tu ruta habitual' : 'Detour detected from your usual route'}
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {language === 'es' ? 'Esto puede ocurrir por diferentes motivos:' : 'This can happen due to several reasons:'}
            </p>
            <ul className="text-xs text-zinc-400 mt-2 space-y-1 ml-2">
              <li>• {language === 'es' ? 'Ya te bajaste del colectivo' : 'You already got off the bus'}</li>
              <li>• {language === 'es' ? 'El colectivo tomó un desvío de emergencia' : 'The bus took an emergency detour'}</li>
              <li>• {language === 'es' ? 'Estás en otra ruta diferente' : 'You are on a different route'}</li>
            </ul>
          </div>

          {/* Opciones: jerarquía clara — una acción primaria, dos secundarias */}
          <div className="space-y-2">
            <p className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">
              {language === 'es' ? '¿Qué está pasando?' : 'What is happening?'}
            </p>

            <button
              onClick={onConfirmarBajada}
              className="w-full p-4 rounded-card bg-ok-dim hover:brightness-110 transition-all flex items-center gap-4 active:scale-98"
            >
              <LogOut className="w-6 h-6 text-ink-950 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-ink-950 text-sm">
                  {language === 'es' ? 'Ya me bajé del colectivo' : 'I already got off the bus'}
                </p>
                <p className="text-xs text-ink-950/70 mt-0.5">
                  {language === 'es' ? 'Dejaré de compartir mi ubicación' : 'Stop sharing my location'}
                </p>
              </div>
            </button>

            <div className="divide-y divide-white/5 border border-white/10 rounded-card overflow-hidden">
              <button
                onClick={onConfirmarDesvio}
                className="w-full p-4 hover:bg-white/5 transition-all flex items-center gap-4 active:scale-98"
              >
                <Navigation className="w-5 h-5 text-led-400 shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-led-300 text-sm">
                    {language === 'es' ? 'Hay un desvío en la ruta' : 'There is a detour on the route'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {language === 'es' ? 'Continuaré compartiendo la nueva ruta' : 'Keep sharing the new detoured path'}
                  </p>
                </div>
              </button>

              <button
                onClick={onSeguirViajando}
                className="w-full p-4 hover:bg-white/5 transition-all flex items-center gap-4 active:scale-98"
              >
                <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-bold text-zinc-200 text-sm">
                    {language === 'es' ? 'Sigo viajando (falsa alarma)' : 'Still riding (false alarm)'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {language === 'es' ? 'Actualizar y aprender mi ruta habitual' : 'Update and learn my usual route'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-white/[0.03] border border-white/5 rounded-card p-3.5 text-2xs text-zinc-400 leading-relaxed">
            <p className="font-bold mb-1 text-zinc-200 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              {language === 'es' ? '¿Por qué preguntamos?' : 'Why are we asking?'}
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
