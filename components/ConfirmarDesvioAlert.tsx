import React, { useState } from 'react';
import { Navigation, Check, X, Users, AlertTriangle } from 'lucide-react';
import { reportesAPI } from '../services/api';

interface ConfirmarDesvioAlertProps {
  reporteId: string;
  linea: string;
  ramal?: string;
  userId: string;
  confirmacionesActuales: number;
  confirmacionesNecesarias: number;
  onConfirmar: () => void;
  onRechazar: () => void;
  onClose: () => void;
}

export const ConfirmarDesvioAlert: React.FC<ConfirmarDesvioAlertProps> = ({
  reporteId,
  linea,
  ramal,
  userId,
  confirmacionesActuales,
  confirmacionesNecesarias,
  onConfirmar,
  onRechazar,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pulsando, setPulsando] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPulsando(p => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmar = async () => {
    setIsSubmitting(true);
    try {
      const resultado = await reportesAPI.confirmar(reporteId, userId);
      
      if (resultado?.status === 'ok') {
        onConfirmar();
      } else {
        alert(resultado?.mensaje || 'Error al confirmar');
        onClose();
      }
    } catch (error) {
      console.error('Error confirmando desvío:', error);
      alert('Error al confirmar el desvío');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechazar = () => {
    onRechazar();
  };

  const faltanConfirmaciones = confirmacionesNecesarias - confirmacionesActuales;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-3xl w-full max-w-md shadow-[0_15px_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95">
        {/* Header con alerta */}
        <div className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 backdrop-blur-xl p-6 text-white rounded-t-3xl relative overflow-hidden border-b border-white/10">
          {/* Pulso de fondo */}
          <div 
            className={`absolute inset-0 bg-white transition-opacity duration-1000 ${
              pulsando ? 'opacity-10' : 'opacity-0'
            }`}
          />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse border border-white/10">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">¿Confirmás el desvío?</h2>
              <p className="text-sm text-indigo-200/90 font-medium">Línea {linea} {ramal && `(${ramal})`}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Explicación */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
            <p className="text-indigo-300 font-bold mb-2 text-sm">
              ↪️ Un pasajero reportó que este colectivo se desvió
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para confirmar el desvío y alertar a otros usuarios en las paradas, necesitamos que {faltanConfirmaciones} pasajeros más lo validen en vivo.
            </p>
          </div>

          {/* Progress de confirmaciones */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validaciones comunitarias</span>
              <span className="text-sm font-black text-indigo-400">{confirmacionesActuales}/{confirmacionesNecesarias}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/30">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(confirmacionesActuales / confirmacionesNecesarias) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">
                {faltanConfirmaciones === 1 
                  ? '¡Falta solo 1 confirmación!' 
                  : `Faltan ${faltanConfirmaciones} confirmaciones más`}
              </span>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            {/* Opción: Confirmar */}
            <button
              onClick={handleConfirmar}
              disabled={isSubmitting}
              className="w-full p-4 rounded-2xl border border-luminous-green/20 bg-luminous-green/10 hover:bg-luminous-green/20 transition-all flex items-center gap-4 group disabled:opacity-50 active:scale-98"
            >
              <div className="w-12 h-12 bg-luminous-green rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-luminous-green text-sm">Sí, hay desvío</p>
                <p className="text-xs text-slate-400 mt-0.5">Confirmo que el colectivo cambió de ruta</p>
              </div>
            </button>

            {/* Opción: No hay desvío */}
            <button
              onClick={handleRechazar}
              disabled={isSubmitting}
              className="w-full p-4 rounded-2xl border border-slate-700 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 group disabled:opacity-50 active:scale-98"
            >
              <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(71,85,105,0.3)] group-hover:scale-105 transition-transform">
                <X className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-200 text-sm">No, sigue su ruta normal</p>
                <p className="text-xs text-slate-400 mt-0.5">El colectivo va por el recorrido habitual</p>
              </div>
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-[10px] text-amber-400 leading-relaxed shadow-inner">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-bold text-amber-300">¿Por qué 3 confirmaciones?</span>
                <br />
                Por seguridad y consistencia, los reportes comunitarios de desvío requieren validación cruzada antes de notificar oficialmente a toda la comunidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
