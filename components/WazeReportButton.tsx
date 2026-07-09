import React, { useState } from 'react';
import { X, TriangleAlert, Users, Armchair, Clock, Zap, TrafficCone, ShieldAlert, Ghost, CornerUpRight, ChevronRight, LoaderCircle, Info, Send, ArrowLeft } from 'lucide-react';
import { reportesAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { LINEAS_BASE } from '../constants';
import { Geolocation } from '@capacitor/geolocation';
import { Button } from './Button';

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
  const [lineaError, setLineaError] = useState(false);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    {
      id: 'lleno',
      Icon: Users,
      iconColor: 'text-danger',
      label: language === 'es' ? 'Colectivo lleno' : 'Full bus',
      description: language === 'es' ? 'No hay lugar' : 'No seats/room left'
    },
    {
      id: 'vacio',
      Icon: Armchair,
      iconColor: 'text-ok',
      label: language === 'es' ? 'Colectivo vacío' : 'Empty bus',
      description: language === 'es' ? 'Hay mucho lugar' : 'Plenty of seats/room'
    },
    {
      id: 'demora',
      Icon: Clock,
      iconColor: 'text-led-400',
      label: language === 'es' ? 'Gran demora' : 'Heavy delay',
      description: language === 'es' ? 'Mucho tráfico/espera' : 'Heavy traffic/long wait'
    },
    {
      id: 'accidente',
      Icon: Zap,
      iconColor: 'text-danger',
      label: language === 'es' ? 'Accidente' : 'Accident',
      description: language === 'es' ? 'Choque o accidente' : 'Collision or crash'
    },
    {
      id: 'piquete',
      Icon: TrafficCone,
      iconColor: 'text-led-400',
      label: language === 'es' ? 'Corte/Piquete' : 'Protest / Roadblock',
      description: language === 'es' ? 'Calle cortada' : 'Street blocked'
    },
    {
      id: 'inseguridad',
      Icon: ShieldAlert,
      iconColor: 'text-danger',
      label: language === 'es' ? 'Zona insegura' : 'Unsafe area',
      description: language === 'es' ? 'Ten precaución' : 'Use caution'
    },
    {
      id: 'fantasma',
      Icon: Ghost,
      iconColor: 'text-zinc-400',
      label: language === 'es' ? 'Bondi fantasma' : 'Ghost bus',
      description: language === 'es' ? 'No llegó el colectivo' : 'Bus did not arrive'
    },
    {
      id: 'desvio',
      Icon: CornerUpRight,
      iconColor: 'text-led-400',
      label: language === 'es' ? 'Desvío' : 'Route Detour',
      description: language === 'es' ? 'Cambió de ruta' : 'Detoured route'
    }
  ];

  const handleOpen = () => {
    if (demoMode) {
      showToast(t('demo_blocked_action'), 'info');
      return;
    }
    setLinea(lineaActual || '');
    setLineaError(false);
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
      setLineaError(true);
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
        aria-label={language === 'es' ? 'Reportar incidente' : 'Report incident'}
        className="fixed top-20 right-4 w-14 h-14 bg-ink-900/90 backdrop-blur-xl rounded-card shadow-fab flex items-center justify-center text-led-400 hover:text-led-300 hover:scale-105 active:scale-98 transition-all z-chrome border border-led-500/40"
      >
        <TriangleAlert className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-overlay flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card rounded-t-sheet sm:rounded-sheet w-full max-w-lg max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-ink-900/95 backdrop-blur-xl p-6 rounded-t-sheet border-b border-white/10 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-led-400/15 rounded-field flex items-center justify-center border border-led-500/30">
                <TriangleAlert className="w-6 h-6 text-led-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                  {language === 'es' ? 'Reportar Incidente' : 'Report Incident'}
                </h2>
                <p className="text-sm text-zinc-400 font-medium">
                  {language === 'es' ? 'Ayudá a la comunidad en vivo' : 'Help the community live'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Types */}
        {!selectedType ? (
          <div className="p-6 space-y-2">
            <p className="text-zinc-400 text-2xs font-bold mb-4 uppercase tracking-wider">
              {language === 'es' ? '¿Qué está pasando ahora?' : 'What is happening now?'}
            </p>
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="w-full p-3.5 rounded-card bg-white/[0.03] border border-white/5 hover:border-led-500/40 hover:bg-white/5 transition-all flex items-center gap-4 group active:scale-98"
              >
                <div className="w-11 h-11 bg-ink-800 border border-white/10 rounded-field flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <type.Icon className={`w-5 h-5 ${type.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-zinc-100 group-hover:text-led-300 transition-colors">{type.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{type.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-led-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <button
              onClick={() => setSelectedType(null)}
              className="text-led-400 hover:text-led-300 flex items-center gap-2 font-semibold transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'es' ? 'Volver' : 'Back'}
            </button>

            <div className="bg-white/[0.03] p-6 rounded-card border border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                {(() => {
                  const type = reportTypes.find(r => r.id === selectedType);
                  if (!type) return null;
                  return (
                    <>
                      <div className="w-14 h-14 bg-ink-800 border border-white/10 rounded-card flex items-center justify-center shrink-0">
                        <type.Icon className={`w-7 h-7 ${type.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-zinc-100 tracking-tight">{type.label}</p>
                        <p className="text-sm text-zinc-400">{type.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Selección de línea (la ubicación sale del GPS real) */}
              <div className="space-y-2">
                <label className="block text-2xs font-bold text-zinc-400 uppercase tracking-wider">
                  {t('report_which_line')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LINEAS_BASE.map((l) => (
                    <button
                      key={l.linea}
                      onClick={() => { setLinea(l.linea); setLineaError(false); }}
                      className={`p-2.5 rounded-field font-bold font-mono text-base transition-all active:scale-98 ${linea === l.linea
                        ? 'bg-led-500 text-ink-950'
                        : 'bg-ink-800 text-zinc-300 border border-white/10 hover:bg-ink-700'
                        }`}
                    >
                      {l.linea}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={linea}
                  onChange={(e) => { setLinea(e.target.value); setLineaError(false); }}
                  placeholder={language === 'es' ? 'U otra línea (ej: 39)' : 'Or another line (e.g. 39)'}
                  className={`w-full px-4 py-2.5 text-center font-bold font-mono glass-input placeholder-zinc-500 ${lineaError ? '!border-danger/60' : ''}`}
                />
                {lineaError && (
                  <p className="text-2xs text-danger font-medium">{t('report_need_line')}</p>
                )}
              </div>

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={280}
                placeholder={language === 'es' ? 'Agregá detalles sobre el incidente...' : 'Add details about the incident...'}
                className="w-full p-4 glass-input resize-none placeholder-zinc-500"
                rows={3}
              />
            </div>

            <div className="bg-led-400/[0.06] border border-led-500/20 rounded-field p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-led-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-led-300">
                  {language === 'es' ? 'Tip de la comunidad' : 'Community tip'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {language === 'es'
                    ? 'Tu reporte se publica con tu ubicación actual. Cuanto más específico seas, más útil será para otros pasajeros de la línea.'
                    : 'Your report is published with your current location. The more specific you are, the more helpful it will be for other riders.'}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="py-4 text-lg"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  {language === 'es' ? 'Enviando...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {language === 'es' ? 'Enviar Reporte' : 'Submit Report'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
