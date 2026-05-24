import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Award, MapPin } from 'lucide-react';
import { usuariosAPI } from '../services/api';

interface HistorialProps {
  userId: string;
  onClose: () => void;
}

export const Historial: React.FC<HistorialProps> = ({ userId, onClose }) => {
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 mt-4">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-xl p-6 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-xl shadow-inner border border-white/10">
                <Clock className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Mi Historial</h2>
                <p className="text-xs text-indigo-100/90 font-medium">
                  Tus registros de viaje colaborativo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 mb-1.5 text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Viajes</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {estadisticas?.estadisticas?.viajesRealizados || 0}
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 mb-1.5 text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiempo</p>
              <p className="text-2xl font-black text-purple-400 mt-1">
                {estadisticas?.estadisticas?.tiempoTotalViaje || 0}
                <span className="text-xs font-semibold text-slate-400"> m</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 mb-1.5 text-luminous-green">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Validado</p>
              <p className="text-2xl font-black text-luminous-green mt-1">
                {estadisticas?.estadisticas?.verificacionesRealizadas || 0}
              </p>
            </div>
          </div>

          {/* Viajes por Línea */}
          {estadisticas?.viajesPorLinea && Object.keys(estadisticas.viajesPorLinea).length > 0 && (
            <div>
              <h3 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Líneas Más Usadas
              </h3>
              <div className="space-y-2">
                {Object.entries(estadisticas.viajesPorLinea)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 5)
                  .map(([linea, cantidad]: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3.5 shadow-inner"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm border border-white/10 shadow-md">
                          {linea.split(' ')[0]}
                        </div>
                        <span className="font-bold text-slate-200">{linea}</span>
                      </div>
                      <span className="font-black text-indigo-400 text-sm bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/10">{cantidad} viajes</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Historial Reciente */}
          {estadisticas?.historialReciente && estadisticas.historialReciente.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-purple-400" />
                Viajes Recientes
              </h3>
              <div className="space-y-2">
                {estadisticas.historialReciente.map((viaje: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between shadow-inner"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-luminous-green/20 to-emerald-600/20 rounded-xl flex items-center justify-center text-luminous-green border border-luminous-green/30 font-black text-sm shadow-md">
                        {viaje.linea}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">
                          Línea {viaje.linea} {viaje.ramal !== 'default' && `(${viaje.ramal})`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(viaje.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    {viaje.verificado && (
                      <span className="text-luminous-green font-bold text-xs bg-luminous-green/20 border border-luminous-green/10 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                        ✓ Verificado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin datos */}
          {(!estadisticas || estadisticas.estadisticas?.viajesRealizados === 0) && (
            <div className="text-center py-8">
              <Clock className="w-14 h-14 text-slate-600 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-300 text-lg font-bold">Aún no tenés viajes registrados</p>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Comenzá a usar la app y colaborá compartiendo tu viaje para ver tu historial
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
