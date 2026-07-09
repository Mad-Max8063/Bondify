import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, MapPin, X, Check } from 'lucide-react';
import { usuariosAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface HistorialProps {
  userId: string;
  onClose: () => void;
}

const StatSkeleton: React.FC = () => (
  <div className="bg-white/5 border border-white/5 rounded-card p-4 text-center flex flex-col items-center justify-center gap-2 animate-pulse">
    <div className="h-3 w-10 bg-ink-800 rounded" />
    <div className="h-6 w-8 bg-ink-800 rounded" />
  </div>
);

export const Historial: React.FC<HistorialProps> = ({ userId, onClose }) => {
  const { language } = useLanguage();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [userId]);

  const cargarEstadisticas = async () => {
    setIsLoading(true);
    try {
      const stats = await usuariosAPI.obtenerEstadisticas(userId);
      if (stats) {
        setEstadisticas(stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-overlay flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card rounded-sheet w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-ink-900/95 backdrop-blur-xl p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-led-400/15 border border-led-500/20 rounded-field">
                <Clock className="w-6 h-6 text-led-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                  {language === 'es' ? 'Mi Historial' : 'My History'}
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  {language === 'es' ? 'Tus registros de viaje colaborativo' : 'Your collaborative trip logs'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </div>
          ) : (
            <>
              {/* Estadísticas Generales: tablero LED */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/5 rounded-card p-4 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 mb-1.5 text-zinc-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">
                    {language === 'es' ? 'Viajes' : 'Trips'}
                  </p>
                  <p className="text-2xl font-mono font-bold text-led-400 mt-1">
                    {estadisticas?.estadisticas?.viajesRealizados || 0}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-card p-4 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 mb-1.5 text-zinc-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">
                    {language === 'es' ? 'Tiempo' : 'Duration'}
                  </p>
                  <p className="text-2xl font-mono font-bold text-led-400 mt-1">
                    {estadisticas?.estadisticas?.tiempoTotalViaje || 0}
                    <span className="text-xs font-sans font-semibold text-zinc-400"> m</span>
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-card p-4 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 mb-1.5 text-zinc-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <p className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">
                    {language === 'es' ? 'Validado' : 'Verified'}
                  </p>
                  <p className="text-2xl font-mono font-bold text-ok mt-1">
                    {estadisticas?.estadisticas?.verificacionesRealizadas || 0}
                  </p>
                </div>
              </div>

              {/* Viajes por Línea */}
              {estadisticas?.viajesPorLinea && Object.keys(estadisticas.viajesPorLinea).length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-200 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-led-400" />
                    {language === 'es' ? 'Líneas Más Usadas' : 'Most Used Routes'}
                  </h3>
                  <div className="divide-y divide-white/5 border border-white/5 rounded-card overflow-hidden">
                    {Object.entries(estadisticas.viajesPorLinea)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .slice(0, 5)
                      .map(([linea, cantidad]: any, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/[0.02] p-3.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-ink-950 border border-white/10 rounded-field flex items-center justify-center text-led-400 font-bold font-mono text-sm">
                              {linea.split(' ')[0]}
                            </div>
                            <span className="font-bold text-zinc-200">{linea}</span>
                          </div>
                          <span className="font-mono font-bold text-led-400 text-sm bg-led-400/10 px-3 py-1 rounded-lg border border-led-500/10">
                            {cantidad} {language === 'es' ? 'viajes' : 'trips'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Historial Reciente */}
              {estadisticas?.historialReciente && estadisticas.historialReciente.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-200 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    {language === 'es' ? 'Viajes Recientes' : 'Recent Trips'}
                  </h3>
                  <div className="divide-y divide-white/5 border border-white/5 rounded-card overflow-hidden">
                    {estadisticas.historialReciente.map((viaje: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white/[0.02] p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-ok/10 rounded-field flex items-center justify-center text-ok border border-ok/20 font-bold font-mono text-sm">
                            {viaje.linea}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200">
                              {language === 'es' ? `Línea ${viaje.linea}` : `Line ${viaje.linea}`} {viaje.ramal !== 'default' && `(${viaje.ramal})`}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {new Date(viaje.fecha).toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        {viaje.verificado && (
                          <span className="text-ok font-bold text-xs bg-ok/15 border border-ok/10 px-3 py-1 rounded-full flex items-center gap-1">
                            <Check size={12} /> {language === 'es' ? 'Verificado' : 'Verified'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sin datos */}
              {(!estadisticas || estadisticas.estadisticas?.viajesRealizados === 0) && (
                <div className="text-left py-8 space-y-3">
                  <div className="w-12 h-12 bg-led-400/15 border border-led-500/20 rounded-card flex items-center justify-center">
                    <Clock className="w-6 h-6 text-led-400" />
                  </div>
                  <div>
                    <p className="text-zinc-100 text-lg font-bold">
                      {language === 'es' ? 'Aún no tenés viajes registrados' : 'No trips recorded yet'}
                    </p>
                    <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                      {language === 'es'
                        ? 'Comenzá a usar la app y colaborá compartiendo tu viaje para ver tu historial.'
                        : 'Start riding the bus and share your trip anonymously to see your travel stats here.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
