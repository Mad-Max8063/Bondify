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
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        {/* Header con alerta */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white rounded-t-3xl relative overflow-hidden">
          {/* Pulso de fondo */}
          <div 
            className={`absolute inset-0 bg-white transition-opacity duration-1000 ${
              pulsando ? 'opacity-10' : 'opacity-0'
            }`}
          />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Navigation className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">¿Confirmás el desvío?</h2>
              <p className="text-sm text-blue-100">Línea {linea} {ramal && `(${ramal})`}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Explicación */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-slate-900 font-medium mb-2">
              ↪️ Un pasajero reportó que este colectivo se desvió de su ruta
            </p>
            <p className="text-sm text-slate-600">
              Para confirmar el desvío y alertar a otros usuarios, necesitamos que {faltanConfirmaciones} pasajeros más lo confirmen.
            </p>
          </div>

          {/* Progress de confirmaciones */}
          <div className="bg-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Confirmaciones</span>
              <span className="text-sm font-bold text-blue-600">{confirmacionesActuales}/{confirmacionesNecesarias}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(confirmacionesActuales / confirmacionesNecesarias) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">
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
              className="w-full p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all flex items-center gap-4 group disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-green-900">Sí, hay desvío</p>
                <p className="text-xs text-green-700">Confirmo que el colectivo cambió de ruta</p>
              </div>
            </button>

            {/* Opción: No hay desvío */}
            <button
              onClick={handleRechazar}
              disabled={isSubmitting}
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex items-center gap-4 group disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <X className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-700">No, sigue su ruta normal</p>
                <p className="text-xs text-slate-500">El colectivo va por el recorrido habitual</p>
              </div>
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-bold">¿Por qué 3 confirmaciones?</span>
                <br />
                Por seguridad, los reportes de desvío necesitan ser validados por varios pasajeros antes de alertar a quienes esperan adelante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
