import React, { useState } from 'react';
import { X, ThumbsUp } from 'lucide-react';
import { reportesAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { LINEAS_BASE } from '../constants';
import { Geolocation } from '@capacitor/geolocation';

interface WazeReportButtonProps {
  onReportCreated?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  lineaActual?: string;
  demoMode?: boolean;
}

export const WazeReportButton: React.FC<WazeReportButtonProps> = ({ onReportCreated, userLocation, lineaActual, demoMode }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [linea, setLinea] = useState('');
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    {
      id: 'lleno',
      icon: '🚌',
      label: language === 'es' ? 'Colectivo lleno' : 'Full bus',
      color: 'bg-red-500',
      description: language === 'es' ? 'No hay lugar' : 'No seats/room left'
    },
    {
      id: 'vacio',
      icon: '✅',
      label: language === 'es' ? 'Colectivo vacío' : 'Empty bus',
      color: 'bg-green-500',
      description: language === 'es' ? 'Hay mucho lugar' : 'Plenty of seats/room'
    },
    {
      id: 'demora',
      icon: '⏰',
      label: language === 'es' ? 'Gran demora' : 'Heavy delay',
      color: 'bg-orange-500',
      description: language === 'es' ? 'Mucho tráfico/espera' : 'Heavy traffic/long wait'
    },
    {
      id: 'accidente',
      icon: '💥',
      label: language === 'es' ? 'Accidente' : 'Accident',
      color: 'bg-red-600',
      description: language === 'es' ? 'Choque o accidente' : 'Collision or crash'
    },
    {
      id: 'piquete',
      icon: '🚧',
      label: language === 'es' ? 'Corte/Piquete' : 'Protest / Roadblock',
      color: 'bg-yellow-600',
      description: language === 'es' ? 'Calle cortada' : 'Street blocked'
    },
    {
      id: 'inseguridad',
      icon: '⚠️',
      label: language === 'es' ? 'Zona insegura' : 'Unsafe area',
      color: 'bg-purple-600',
      description: language === 'es' ? 'Ten precaución' : 'Use caution'
    },
    {
      id: 'fantasma',
      icon: '👻',
      label: language === 'es' ? 'Bondi fantasma' : 'Ghost bus',
      color: 'bg-gray-600',
      description: language === 'es' ? 'No llegó el colectivo' : 'Bus did not arrive'
    },
    {
      id: 'desvio',
      icon: '↪️',
      label: language === 'es' ? 'Desvío' : 'Route Detour',
      color: 'bg-blue-500',
      description: language === 'es' ? 'Cambió de ruta' : 'Detoured route'
    }
  ];

  const handleOpen = () => {
    if (demoMode) {
      showToast(t('demo_blocked_action'), 'info');
      return;
    }
    setLinea(lineaActual || '');
    setShowMenu(true);
  };

  // El reporte usa la ubicación REAL del usuario: la del viaje activo si existe,
  // o una lectura one-shot del GPS. Sin ubicación no se envía (nada inventado).
  const obtenerUbicacion = async (): Promise<{ lat: number; lng: number } | null> => {
    if (userLocation && userLocation.lat) return userLocation;
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') return null;
      }
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch {
      return null;
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedType) return;

    const lineaLimpia = linea.trim();
    if (!lineaLimpia) {
      showToast(t('report_need_line'), 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const ubicacion = await obtenerUbicacion();
      if (!ubicacion) {
        showToast(t('report_need_location'), 'error');
        setIsSubmitting(false);
        return;
      }

      const resultado = await reportesAPI.crear({
        tipo: selectedType,
        linea: lineaLimpia,
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        comentario: comentario
      });

      if (!resultado || resultado.status !== 'ok') {
        throw new Error('Backend rechazó el reporte');
      }

      // Mostrar confirmación según el tipo de reporte
      const tiposConfirmacion = ['lleno', 'desvio'];
      const requiereConfirmacion = tiposConfirmacion.includes(selectedType);

      if (requiereConfirmacion) {
        showToast(t('report_pending_confirmation'), 'success');
      } else {
        showToast(t('report_success'), 'success');
      }

      setShowMenu(false);
      setSelectedType(null);
      setComentario('');

      if (onReportCreated) onReportCreated();
    } catch (error) {
      console.error('Error enviando reporte:', error);
      showToast(t('report_error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showMenu) {
    return (
      <button
        onClick={handleOpen}
        className="fixed top-20 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-[0_4px_20px_rgba(249,115,22,0.4)] flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-95 transition-all z-[9998] animate-pulse border border-white/20"
      >
        ⚠️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-xl p-6 text-white rounded-t-3xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                ⚠️
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {language === 'es' ? 'Reportar Incidente' : 'Report Incident'}
                </h2>
                <p className="text-sm text-orange-100/90 font-medium">
                  {language === 'es' ? 'Ayudá a la comunidad en vivo' : 'Help the community live'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Types */}
        {!selectedType ? (
          <div className="p-6 space-y-3">
            <p className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">
              {language === 'es' ? '¿Qué está pasando ahora?' : 'What is happening now?'}
            </p>
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/50 hover:bg-white/10 transition-all flex items-center gap-4 group"
              >
                <div className={`w-14 h-14 ${type.color} rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform`}>
                  {type.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{type.description}</p>
                </div>
                <div className="text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">
                  →
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <button
              onClick={() => setSelectedType(null)}
              className="text-orange-400 hover:text-orange-300 flex items-center gap-2 font-semibold transition-colors"
            >
              {language === 'es' ? '← Volver' : '← Back'}
            </button>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${reportTypes.find(r => r.id === selectedType)?.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                  {reportTypes.find(r => r.id === selectedType)?.icon}
                </div>
                <div>
                  <p className="font-bold text-xl text-slate-100">{reportTypes.find(r => r.id === selectedType)?.label}</p>
                  <p className="text-sm text-slate-400">{reportTypes.find(r => r.id === selectedType)?.description}</p>
                </div>
              </div>

              {/* Selección de línea (la ubicación sale del GPS real) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('report_which_line')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LINEAS_BASE.map((l) => (
                    <button
                      key={l.linea}
                      onClick={() => setLinea(l.linea)}
                      className={`p-2.5 rounded-xl font-black text-base transition-all active:scale-95 ${linea === l.linea
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)] border border-orange-400/40'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        }`}
                    >
                      {l.linea}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={linea}
                  onChange={(e) => setLinea(e.target.value)}
                  placeholder={language === 'es' ? 'U otra línea (ej: 39)' : 'Or another line (e.g. 39)'}
                  className="w-full px-4 py-2.5 text-center font-bold glass-input border border-slate-700/50 bg-slate-900/50 text-slate-100 rounded-xl focus:border-orange-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={280}
                placeholder={language === 'es' ? 'Agregá detalles sobre el incidente...' : 'Add details about the incident...'}
                className="w-full p-4 rounded-xl bg-obsidian-dark border border-slate-700/80 focus:border-orange-500 text-slate-100 focus:outline-none resize-none placeholder-slate-500 transition-colors"
                rows={3}
              />
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-bold text-indigo-300">
                  {language === 'es' ? 'Tip de la comunidad' : 'Community tip'}
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {language === 'es'
                    ? 'Tu reporte se publica con tu ubicación actual. Cuanto más específico seas, más útil será para otros pasajeros de la línea.'
                    : 'Your report is published with your current location. The more specific you are, the more helpful it will be for other riders.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting || !linea.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/10 hover:brightness-110"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {language === 'es' ? 'Enviando...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" />
                  {language === 'es' ? 'Enviar Reporte' : 'Submit Report'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
