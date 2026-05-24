import React, { useState } from 'react';
import { Navigation, Bus, X, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Routine } from '../types';

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-3xl w-full max-w-md shadow-[0_15px_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto scrollbar-thin flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-xl p-6 text-white rounded-t-3xl border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border border-white/10 flex-shrink-0 animate-pulse">
                <Navigation className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{t('traveler_title')}</h2>
                <p className="text-xs text-green-100/90 font-medium">{t('onboarding_privacy')}</p>
              </div>
            </div>
            <button
              onClick={onCancelar}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Explicación */}
          <div className="bg-luminous-green/10 border border-luminous-green/20 rounded-2xl p-4 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-0.5 flex-shrink-0">📍</div>
              <div>
                <p className="font-bold text-luminous-green mb-1 text-sm">{t('traveler_how_works')}</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('traveler_how_works_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Selección de línea */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('traveler_choose_line')}
            </label>

            {/* Líneas comunes - botones rápidos */}
            <div className="grid grid-cols-5 gap-2">
              {lineasComunes.map((l) => (
                <button
                  key={l.linea}
                  onClick={() => setLinea(l.linea)}
                  className={`p-3 rounded-xl font-black text-lg transition-all relative overflow-hidden active:scale-95 flex items-center justify-center ${linea === l.linea
                      ? 'bg-gradient-to-br from-luminous-green to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-105 border border-luminous-green/30'
                      : l.isRoutine
                        ? 'bg-luminous-green/10 text-luminous-green border border-luminous-green/30 hover:bg-luminous-green/20'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  {l.linea}
                  {l.isRoutine && (
                    <div className="absolute top-0 right-0 p-0.5">
                      <Star className="w-2 h-2 text-luminous-amber fill-luminous-amber" />
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
              className="w-full px-4 py-3 text-center text-lg font-bold glass-input border border-slate-700/50 bg-slate-900/50 text-slate-100 rounded-xl focus:border-luminous-green focus:shadow-[0_0_12px_rgba(16,185,129,0.2)] focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Selección de ramal */}
          {linea && (
            <div className="animate-in slide-in-from-top duration-300 space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('traveler_choose_ramal')}
              </label>
              <select
                value={ramal}
                onChange={(e) => setRamal(e.target.value)}
                className="w-full px-4 py-3 glass-input border border-slate-700/50 bg-slate-900/50 text-slate-100 rounded-xl focus:border-luminous-green focus:outline-none"
              >
                <option value="" className="bg-obsidian-light text-slate-400">{t('traveler_select_ramal')}</option>
                {lineasComunes.find(l => l.linea === linea)?.ramales.map(r => (
                  <option key={r} value={r} className="bg-obsidian text-slate-100">{r}</option>
                ))}
                <option value="Centro" className="bg-obsidian text-slate-100">Centro</option>
                <option value="Otro" className="bg-obsidian text-slate-100">{t('traveler_select_ramal_other')}</option>
              </select>
            </div>
          )}

          {/* Botones */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleActivar}
              disabled={!linea}
              className="w-full bg-gradient-to-r from-luminous-green to-emerald-600 hover:from-emerald-500 hover:to-luminous-green text-white py-4 rounded-2xl font-black text-base shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              {t('traveler_activate')}
            </button>

            <button
              onClick={onCancelar}
              className="w-full bg-white/5 border border-slate-700/50 text-slate-300 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-98"
            >
              {t('traveler_cancel')}
            </button>
          </div>

          {/* Advertencia de batería */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              {t('traveler_battery_warning')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
