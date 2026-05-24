import React from 'react';
import { UserMode } from '../types';
import { Zap, Users, ShieldCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: (mode: UserMode) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="h-dynamic bg-obsidian flex flex-col p-6 items-center justify-center overflow-y-auto text-slate-100">
      <div className="w-full max-w-md space-y-6">

        {/* 3D Animated Colectivo Preview Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto relative flex items-center justify-center filter drop-shadow-[0_8px_24px_rgba(16,185,129,0.25)] select-none">
            <svg viewBox="0 0 64 64" className="w-24 h-24">
              <defs>
                <linearGradient id="onboardBusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <filter id="onboardGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <ellipse cx="32" cy="52" rx="22" ry="4" fill="rgba(0,0,0,0.6)" />

              <g className="animate-colectivo-bounce">
                <path d="M 12 36 L 50 39" stroke="#10B981" strokeWidth="4" strokeLinecap="round" filter="url(#onboardGlow)" opacity="0.9" />

                <path d="M 12 36 L 36 46 L 36 18 L 12 12 Z" fill="url(#onboardBusGrad)" opacity="0.95" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                
                <path d="M 36 46 L 50 38 L 50 14 L 36 18 Z" fill="url(#onboardBusGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

                <path d="M 38 19 L 48 16 L 48 26 L 38 29 Z" fill="#E2E8F0" opacity="0.8" />
                <path d="M 39 20 L 47 18 L 47 25 L 39 27 Z" fill="#60A5FA" opacity="0.7" />
                
                <ellipse cx="42" cy="23" rx="1.8" ry="3" fill="#000" />
                <circle cx="41.5" cy="22" r="0.6" fill="#fff" />
                <ellipse cx="45" cy="21.5" rx="1.8" ry="3" fill="#000" />
                <circle cx="44.5" cy="20.5" r="0.6" fill="#fff" />

                <path d="M 14 16 L 20 18 L 20 26 L 14 24 Z" fill="#1E293B" opacity="0.9" />
                <path d="M 22 19 L 28 21 L 28 29 L 22 27 Z" fill="#1E293B" opacity="0.9" />
                <path d="M 30 22 L 34 23.5 L 34 31.5 L 30 30 Z" fill="#1E293B" opacity="0.9" />
                
                <path d="M 38 13.5 L 48 11.5 L 48 14.5 L 38 16.5 Z" fill="#0F172A" />
                <text x="39" y="15" fill="#F59E0B" fontSize="3.5" fontFamily="monospace" fontWeight="black" transform="skewY(4) rotate(-3)">152</text>

                <circle cx="49" cy="32" r="2" fill="#FBBF24" filter="url(#onboardGlow)" />
              </g>

              <g className="animate-wheel-spin-rear">
                <circle cx="26" cy="41" r="5" fill="#030712" />
                <circle cx="26" cy="41" r="2.5" fill="#4B5563" />
                <line x1="22" y1="41" x2="30" y2="41" stroke="#9CA3AF" strokeWidth="0.8" />
                <line x1="26" y1="37" x2="26" y2="45" stroke="#9CA3AF" strokeWidth="0.8" />
              </g>

              <g className="animate-wheel-spin-front">
                <circle cx="45" cy="42.5" r="5" fill="#030712" />
                <circle cx="45" cy="42.5" r="2.5" fill="#4B5563" />
                <line x1="41" y1="42.5" x2="49" y2="42.5" stroke="#9CA3AF" strokeWidth="0.8" />
                <line x1="45" y1="38.5" x2="45" y2="46.5" stroke="#9CA3AF" strokeWidth="0.8" />
              </g>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">Bondify</h1>
            <p className="text-slate-400 text-sm mt-1">Viajá mejor, esperá menos.</p>
          </div>
        </div>

        {/* Option Selection Block */}
        <div className="space-y-4 pt-4">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">¿Cómo querés usar la app?</p>

          {/* Option A: Efficient Mode */}
          <button
            onClick={() => onComplete(UserMode.EFFICIENT)}
            className="w-full glass-card border border-white/5 p-5 rounded-2xl hover:bg-white/10 hover:border-slate-500/30 transition-all active:scale-98 group text-left shadow-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:bg-white/10 transition-all shadow-inner">
                <Zap className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">Simple</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Modo Eficiente</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Quiero la herramienta de consulta rápida. Solo dame los horarios de arribo precisos, alertas de mapa y cronómetro de seguridad.
            </p>
          </button>

          {/* Option B: Community Mode */}
          <button
            onClick={() => onComplete(UserMode.COMMUNITY)}
            className="w-full bg-gradient-to-br from-indigo-500/15 to-purple-600/15 border border-indigo-500/30 hover:border-indigo-400/50 p-5 rounded-2xl transition-all active:scale-98 group text-left shadow-[0_4px_30px_rgba(99,102,241,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="p-2.5 bg-indigo-500/25 border border-indigo-500/20 rounded-xl">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-500/10 shadow-inner">Recomendado</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1 relative z-10">Modo Comunidad</h3>
            <p className="text-slate-400 text-xs leading-relaxed relative z-10">
              ¡Sumate al tránsito colaborativo! Reportá incidentes en vivo, validá desvíos de colectivos y viajá más seguro junto a otros pasajeros en tiempo real.
            </p>
          </button>
        </div>

        {/* Option C: Guest Mode */}
        <button
          onClick={() => onComplete(UserMode.GUEST)}
          className="w-full mt-4 p-3 rounded-xl border border-dashed border-slate-700/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2 group active:scale-98"
        >
          <span className="text-xs font-bold tracking-wider uppercase group-hover:underline">Ingresar como Invitado</span>
        </button>
      </div>

      {/* Safety Footer */}
      <div className="text-center pt-8">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
          <ShieldCheck size={12} />
          <span>Privacidad garantizada • Conexión cifrada de geolocalización</span>
        </div>
      </div>
    </div>
  );
};