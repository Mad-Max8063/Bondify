import React from 'react';
import { UserMode } from '../types';
import { Zap, Users, ShieldCheck, Map } from 'lucide-react';

interface OnboardingProps {
  onComplete: (mode: UserMode) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="h-dynamic bg-slate-50 flex flex-col p-6 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-1">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-600/20 rotate-3">
            <span className="text-3xl">🚌</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bondify</h1>
          <p className="text-slate-500 text-sm">Viajá mejor, esperá menos.</p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-center text-sm font-medium text-slate-800">¿Cómo querés usar la app?</p>

          {/* Option A: Efficient */}
          <button
            onClick={() => onComplete(UserMode.EFFICIENT)}
            className="w-full bg-white border-2 border-slate-200 p-6 rounded-2xl hover:border-slate-400 transition-all active:scale-95 group text-left shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                <Zap className="w-6 h-6 text-slate-700" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wider">Simple</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Modo Eficiente</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Quiero la herramienta. Solo dame horarios precisos, alertas y el cronómetro de seguridad.
            </p>
          </button>

          {/* Option B: Community */}
          <button
            onClick={() => onComplete(UserMode.COMMUNITY)}
            className="w-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 group text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-indigo-200 bg-white/10 px-2 py-1 rounded-full uppercase tracking-wider border border-white/10">Recomendado</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1 relative z-10">Modo Comunidad</h3>
            <p className="text-indigo-100 text-sm leading-relaxed relative z-10">
              ¡Me sumo al juego! Acumulá puntos ayudando a otros, subí de nivel y personalizá tu Garage.
            </p>
          </button>
        </div>

        {/* Option C: Guest Mode */}
        <button
          onClick={() => onComplete(UserMode.GUEST)}
          className="w-full mt-4 p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-sm font-medium group-hover:underline">Ingresar como Invitado</span>
        </button>
      </div>

      <div className="text-center pt-8">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} />
          <span>Privacidad total garantizada en ambos modos</span>
        </div>
      </div>
    </div>
  );
};