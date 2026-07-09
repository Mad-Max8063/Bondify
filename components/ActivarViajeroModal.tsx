import React, { useState } from 'react';
import { Navigation, X, Star, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Routine } from '../types';
import { Button } from './Button';

interface ActivarViajeroModalProps {
  onActivar: (linea: string, ramal: string) => void;
  onCancelar: () => void;
  routines?: Routine[];
}

export const ActivarViajeroModal: React.FC<ActivarViajeroModalProps> = ({ onActivar, onCancelar, routines = [] }) => {
  const [linea, setLinea] = useState('');
  const [ramal, setRamal] = useState('');
  const { t } = useLanguage();

  // Combinar líneas comunes con líneas de las rutinas del usuario
  const routineLines = routines.map(r => ({ linea: r.line, ramales: ['Centro'], isRoutine: true }));

  // Evitar duplicados si una rutina ya está en lineasComunes
  const baseLines = [
    { linea: '152', ramales: ['Olivos', 'Centro', 'Tigre'] },
    { linea: '60', ramales: ['Tigre', 'Constitución'] },
    { linea: '130', ramales: ['Panamericana', 'Centro'] },
    { linea: '168', ramales: ['La Lucila', 'Palermo'] },
    { linea: '15', ramales: ['Villa Urquiza', 'Barracas'] }
  ];

  const lineasComunes = [...routineLines];
  baseLines.forEach(bl => {
    if (!lineasComunes.find(rl => rl.linea === bl.linea)) {
      lineasComunes.push({ ...bl, isRoutine: false });
    }
  });

  const handleActivar = () => {
    if (linea) {
      onActivar(linea, ramal || 'Centro');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-alert flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card rounded-sheet w-full max-w-md animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto scrollbar-thin flex flex-col">
        {/* Header */}
        <div className="bg-ink-900/95 backdrop-blur-xl p-6 rounded-t-sheet border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-ok/15 rounded-full flex items-center justify-center border border-ok/20 shrink-0">
                <Navigation className="w-7 h-7 text-ok" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">{t('traveler_title')}</h2>
                <p className="text-xs text-zinc-400 font-medium">{t('onboarding_privacy')}</p>
              </div>
            </div>
            <button
              onClick={onCancelar}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 border border-white/10 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Explicación */}
          <div className="bg-ok/10 border border-ok/20 rounded-card p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-ok mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-ok mb-1 text-sm">{t('traveler_how_works')}</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {t('traveler_how_works_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Selección de línea */}
          <div className="space-y-3">
            <label className="block text-2xs font-bold text-zinc-400 uppercase tracking-wider">
              {t('traveler_choose_line')}
            </label>

            {/* Líneas comunes - botones rápidos */}
            <div className="grid grid-cols-5 gap-2">
              {lineasComunes.map((l) => (
                <button
                  key={l.linea}
                  onClick={() => setLinea(l.linea)}
                  className={`p-3 rounded-field font-bold font-mono text-lg transition-all relative overflow-hidden active:scale-98 flex items-center justify-center ${linea === l.linea
                      ? 'bg-ok-dim text-ink-950'
                      : l.isRoutine
                        ? 'bg-ok/10 text-ok border border-ok/30 hover:bg-ok/15'
                        : 'bg-ink-800 text-zinc-300 border border-white/10 hover:bg-ink-700'
                    }`}
                >
                  {l.linea}
                  {l.isRoutine && (
                    <div className="absolute top-0 right-0 p-0.5">
                      <Star className="w-2 h-2 text-led-400 fill-led-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Input manual */}
            <input
              type="text"
              value={linea}
              onChange={(e) => setLinea(e.target.value)}
              placeholder={t('traveler_manual_placeholder')}
              className="w-full px-4 py-3 text-center text-lg font-bold font-mono glass-input placeholder-zinc-500"
            />
          </div>

          {/* Selección de ramal */}
          {linea && (
            <div className="animate-in slide-in-from-top duration-300 space-y-2">
              <label className="block text-2xs font-bold text-zinc-400 uppercase tracking-wider">
                {t('traveler_choose_ramal')}
              </label>
              <select
                value={ramal}
                onChange={(e) => setRamal(e.target.value)}
                className="w-full px-4 py-3 glass-input"
              >
                <option value="" className="bg-ink-900 text-zinc-400">{t('traveler_select_ramal')}</option>
                {lineasComunes.find(l => l.linea === linea)?.ramales.map(r => (
                  <option key={r} value={r} className="bg-ink-900 text-zinc-100">{r}</option>
                ))}
                <option value="Centro" className="bg-ink-900 text-zinc-100">Centro</option>
                <option value="Otro" className="bg-ink-900 text-zinc-100">{t('traveler_select_ramal_other')}</option>
              </select>
            </div>
          )}

          {/* Botones */}
          <div className="space-y-3 pt-2">
            <Button variant="ok" fullWidth onClick={handleActivar} disabled={!linea} className="py-4 text-base">
              <Navigation className="w-5 h-5" />
              {t('traveler_activate')}
            </Button>

            <Button variant="secondary" fullWidth onClick={onCancelar} className="py-3.5 text-sm">
              {t('traveler_cancel')}
            </Button>
          </div>

          {/* Consentimiento de geolocalización + batería */}
          <div className="text-left pt-2 space-y-1.5">
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              {t('traveler_consent')}{' '}
              <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-led-300 underline">
                {t('onboarding_legal_privacy')}
              </a>
            </p>
            <p className="text-xs text-zinc-500 font-medium">
              {t('traveler_battery_warning')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
