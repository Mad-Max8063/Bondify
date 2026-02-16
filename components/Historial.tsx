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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Mi Historial</h2>
                <p className="text-sm text-indigo-100">
                  Tus viajes y estadísticas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Viajes Totales</p>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {estadisticas?.estadisticas?.viajesRealizados || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">Puntos Ganados</p>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {estadisticas?.estadisticas?.puntosGanados || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Tiempo Total</p>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {estadisticas?.estadisticas?.tiempoTotalViaje || 0}
                <span className="text-sm"> min</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <p className="text-sm font-medium text-orange-900">Verificaciones</p>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {estadisticas?.estadisticas?.verificacionesRealizadas || 0}
              </p>
            </div>
          </div>

          {/* Nivel y Progreso */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600">Nivel Actual</p>
                <p className="text-4xl font-black text-slate-900">
                  {estadisticas?.garage?.nivel || 1}
                </p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {estadisticas?.garage?.nivel || 1}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Puntos</span>
                <span className="font-bold text-slate-900">
                  {estadisticas?.garage?.puntos || 0} / {((estadisticas?.garage?.nivel || 1) * 100)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((estadisticas?.garage?.puntos || 0) % 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Viajes por Línea */}
          {estadisticas?.viajesPorLinea && Object.keys(estadisticas.viajesPorLinea).length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Líneas Más Usadas
              </h3>
              <div className="space-y-2">
                {Object.entries(estadisticas.viajesPorLinea)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 5)
                  .map(([linea, cantidad]: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {linea.split(' ')[0]}
                        </div>
                        <span className="font-medium text-slate-900">{linea}</span>
                      </div>
                      <span className="font-bold text-indigo-600">{cantidad} viajes</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Historial Reciente */}
          {estadisticas?.historialReciente && estadisticas.historialReciente.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Viajes Recientes
              </h3>
              <div className="space-y-2">
                {estadisticas.historialReciente.map((viaje: any, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {viaje.linea}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Línea {viaje.linea} {viaje.ramal !== 'default' && `(${viaje.ramal})`}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(viaje.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    {viaje.verificado && (
                      <span className="text-green-600 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">
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
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Aún no tenés viajes registrados</p>
              <p className="text-slate-400 text-sm mt-2">
                Comenzá a usar la app para ver tu historial
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
