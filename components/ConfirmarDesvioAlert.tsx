import React, { useState } from 'react';
import { Navigation, Check, X, Users, AlertTriangle, LoaderCircle } from 'lucide-react';
import { reportesAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

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
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const handleConfirmar = async () => {
    setIsSubmitting(true);
    try {
      const resultado = await reportesAPI.confirmar(reporteId, userId);

      if (resultado?.status === 'ok') {
        onConfirmar();
      } else {
        showToast(resultado?.mensaje || (language === 'es' ? 'Error al confirmar' : 'Error confirming'), 'error');
        onClose();
      }
    } catch (error) {
      console.error('Error confirmando desvío:', error);
      showToast(language === 'es' ? 'Error al confirmar el desvío' : 'Error confirming route detour', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRechazar = () => {
    onRechazar();
  };

  const faltanConfirmaciones = confirmacionesNecesarias - confirmacionesActuales;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-alert flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card rounded-sheet w-full max-w-md animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto scrollbar-thin flex flex-col">
        {/* Header */}
        <div className="bg-ink-900/95 backdrop-blur-xl p-6 rounded-t-sheet border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-led-400/15 rounded-full flex items-center justify-center border border-led-500/30 shrink-0">
              <Navigation className="w-7 h-7 text-led-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">{t('deviation_confirm_title')}</h2>
              <p className="text-xs text-zinc-400 font-medium">Línea <span className="font-mono text-led-300">{linea}</span> {ramal && `(${ramal})`}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1">
          {/* Explicación */}
          <div className="bg-led-400/10 border border-led-500/20 rounded-card p-4">
            <p className="text-led-300 font-bold mb-1.5 text-sm">
              {t('deviation_confirm_passenger_report')}
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t('deviation_confirm_need_more').replace('{count}', String(faltanConfirmaciones))}
            </p>
          </div>

          {/* Progress de confirmaciones */}
          <div className="bg-white/[0.03] border border-white/5 rounded-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">{t('deviation_confirm_community_validations')}</span>
              <span className="text-sm font-bold font-mono text-led-400">{confirmacionesActuales}/{confirmacionesNecesarias}</span>
            </div>
            <div className="w-full bg-ink-800 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-led-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(confirmacionesActuales / confirmacionesNecesarias) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300">
                {faltanConfirmaciones === 1
                  ? t('deviation_confirm_missing_single')
                  : t('deviation_confirm_missing_multiple').replace('{count}', String(faltanConfirmaciones))}
              </span>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmar}
              disabled={isSubmitting}
              className="w-full p-4 rounded-card bg-ok-dim hover:brightness-110 transition-all flex items-center gap-4 disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <LoaderCircle className="w-6 h-6 text-ink-950 animate-spin shrink-0" />
              ) : (
                <Check className="w-6 h-6 text-ink-950 shrink-0" />
              )}
              <div className="flex-1 text-left">
                <p className="font-bold text-ink-950 text-sm">{t('deviation_confirm_btn')}</p>
                <p className="text-xs text-ink-950/70 mt-0.5">{t('deviation_confirm_btn_sub')}</p>
              </div>
            </button>

            <button
              onClick={handleRechazar}
              disabled={isSubmitting}
              className="w-full p-4 rounded-card bg-ink-800 border border-white/10 hover:bg-ink-700 transition-all flex items-center gap-4 disabled:opacity-50 active:scale-98"
            >
              <X className="w-6 h-6 text-zinc-300 shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-bold text-zinc-200 text-sm">{t('deviation_confirm_reject')}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{t('deviation_confirm_reject_sub')}</p>
              </div>
            </button>
          </div>

          {/* Info adicional */}
          <div className="bg-led-400/10 border border-led-500/20 rounded-card p-4 text-2xs text-led-200 leading-relaxed">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-led-400" />
              <p>
                <span className="font-bold text-led-300">{t('deviation_confirm_reason_title')}</span>
                <br />
                {t('deviation_confirm_reason_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
