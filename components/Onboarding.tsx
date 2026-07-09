import React from 'react';
import { UserMode } from '../types';
import { Zap, Users, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingProps {
  onComplete: (mode: UserMode) => void;
}

// Delay de cascada CSS-only para la entrada de cada bloque.
const rise = (i: number): React.CSSProperties => ({
  animationDelay: `${i * 70}ms`,
});

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="h-dynamic bg-ink-950 flex flex-col p-6 items-center justify-center overflow-y-auto text-zinc-100 relative">

      {/* Sleek Floating Language Selector */}
      <div className="absolute top-4 right-4 z-overlay flex gap-1 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md animate-rise" style={rise(0)}>
        <button
          onClick={() => setLanguage('es')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            language === 'es'
              ? 'bg-led-500 text-ink-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ES
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            language === 'en'
              ? 'bg-led-500 text-ink-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md">

        {/* Header asimétrico: título a la izquierda, bus a la derecha */}
        <div className="flex items-center gap-4 animate-rise" style={rise(1)}>
          <div className="flex-1 text-left">
            <h1 className="text-4xl font-black text-zinc-100 tracking-tighter">Bondify</h1>
            <p className="text-zinc-400 text-sm mt-1">{t('app_subtitle')}</p>
          </div>
          <div className="w-24 h-24 shrink-0 relative flex items-center justify-center select-none">
            <svg viewBox="0 0 64 64" className="w-24 h-24">
              <defs>
                <linearGradient id="onboardBusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1F1F24" />
                  <stop offset="100%" stopColor="#17171B" />
                </linearGradient>
                <linearGradient id="windowGlintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <clipPath id="busWindowsClip">
                  <path d="M 44 17 H 51 Q 53 17 53 21 L 53 28 H 44 Z" />
                  <rect x="33" y="17" width="8" height="11" rx="1.5" />
                  <rect x="22" y="17" width="8" height="11" rx="1.5" />
                  <rect x="11" y="17" width="8" height="11" rx="1.5" />
                </clipPath>
              </defs>

              {/* Undercarriage shadow */}
              <ellipse cx="32" cy="52" rx="26" ry="3.5" fill="rgba(0,0,0,0.6)" />

              <g className="animate-colectivo-bounce">
                {/* Main Bus Body (Side Profile) */}
                <path d="M 8 18 C 8 15, 11 14, 14 14 L 46 14 C 50 14, 55 16, 56 22 L 56 42 C 56 44, 54 45, 52 45 L 12 45 C 9 45, 8 44, 8 42 Z" fill="url(#onboardBusGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />

                {/* Franja ámbar (cucarda porteña) */}
                <line x1="8" y1="33" x2="56" y2="33" stroke="#E4AC55" strokeWidth="2.2" opacity="0.9" />
                <line x1="8" y1="35.5" x2="56" y2="35.5" stroke="#A97127" strokeWidth="1" opacity="0.7" />

                {/* Windshield / Driver window */}
                <path d="M 44 17 H 51 Q 53 17 53 21 L 53 28 H 44 Z" fill="#60A5FA" opacity="0.35" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

                {/* Side windows */}
                <rect x="33" y="17" width="8" height="11" rx="1.5" fill="#09090B" opacity="0.9" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                <rect x="22" y="17" width="8" height="11" rx="1.5" fill="#09090B" opacity="0.9" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                <rect x="11" y="17" width="8" height="11" rx="1.5" fill="#09090B" opacity="0.9" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

                {/* Glass Window Reflection Glint overlay */}
                <g clipPath="url(#busWindowsClip)">
                  <rect x="0" y="12" width="15" height="20" fill="url(#windowGlintGrad)" className="animate-window-glint" />
                </g>

                {/* Headlight ámbar */}
                <circle cx="56" cy="36" r="2.2" fill="#EAC378" />

                {/* Rear Taillight */}
                <circle cx="8" cy="36" r="1.5" fill="#F87171" />

                {/* Cartel LED de destino (protagonista) */}
                <rect x="24" y="8.5" width="16" height="5" rx="1" fill="#09090B" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <text x="26.5" y="12.3" fill="#E4AC55" fontSize="3.4" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" letterSpacing="0.2">152</text>
              </g>

              {/* Rotating Wheels */}
              <g className="animate-wheel-spin-rear-side">
                <circle cx="16" cy="46" r="6" fill="#050507" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <circle cx="16" cy="46" r="2.8" fill="#52525B" />
                <line x1="11" y1="46" x2="21" y2="46" stroke="#A1A1AA" strokeWidth="1" />
                <line x1="16" y1="41" x2="16" y2="51" stroke="#A1A1AA" strokeWidth="1" />
                <line x1="12.5" y1="42.5" x2="19.5" y2="49.5" stroke="#A1A1AA" strokeWidth="0.7" />
                <line x1="12.5" y1="49.5" x2="19.5" y2="42.5" stroke="#A1A1AA" strokeWidth="0.7" />
              </g>

              <g className="animate-wheel-spin-front-side">
                <circle cx="48" cy="46" r="6" fill="#050507" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <circle cx="48" cy="46" r="2.8" fill="#52525B" />
                <line x1="43" y1="46" x2="53" y2="46" stroke="#A1A1AA" strokeWidth="1" />
                <line x1="48" y1="41" x2="48" y2="51" stroke="#A1A1AA" strokeWidth="1" />
                <line x1="44.5" y1="42.5" x2="51.5" y2="49.5" stroke="#A1A1AA" strokeWidth="0.7" />
                <line x1="44.5" y1="49.5" x2="51.5" y2="42.5" stroke="#A1A1AA" strokeWidth="0.7" />
              </g>
            </svg>
          </div>
        </div>

        {/* Option Selection Block */}
        <div className="space-y-4 pt-6">
          <p className="text-left text-2xs font-bold text-zinc-400 uppercase tracking-widest animate-rise" style={rise(2)}>{t('onboarding_question')}</p>

          {/* Option A: Efficient Mode */}
          <button
            onClick={() => onComplete(UserMode.EFFICIENT)}
            className="w-full glass-card p-5 rounded-card hover:bg-white/10 hover:border-white/10 transition-all active:scale-98 group text-left animate-rise"
            style={rise(3)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-field group-hover:bg-white/10 transition-all">
                <Zap className="w-5 h-5 text-zinc-300" />
              </div>
              <span className="text-2xs font-bold text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">{t('onboarding_efficient_badge')}</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-200 mb-1">{t('onboarding_efficient_title')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('onboarding_efficient_desc')}
            </p>
          </button>

          {/* Option B: Community Mode (destacada) */}
          <button
            onClick={() => onComplete(UserMode.COMMUNITY)}
            className="w-full bg-led-400/[0.08] border border-led-500/30 hover:border-led-400/50 p-5 rounded-card transition-all active:scale-98 group text-left animate-rise"
            style={rise(4)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-led-400/15 border border-led-500/20 rounded-field">
                <Users className="w-5 h-5 text-led-400" />
              </div>
              <span className="text-2xs font-bold text-led-300 bg-led-400/15 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-led-500/10">{t('onboarding_community_badge')}</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-200 mb-1">{t('onboarding_community_title')}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {t('onboarding_community_desc')}
            </p>
          </button>
        </div>

        {/* Option C: Guest Mode */}
        <button
          onClick={() => onComplete(UserMode.GUEST)}
          className="w-full mt-4 p-3 rounded-field border border-dashed border-white/15 text-zinc-400 hover:text-led-300 hover:border-led-500/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 group active:scale-98 animate-rise"
          style={rise(5)}
        >
          <span className="text-xs font-bold tracking-wider uppercase group-hover:underline">{t('onboarding_guest_btn')}</span>
        </button>
      </div>

      {/* Safety Footer */}
      <div className="text-center pt-8 space-y-2 animate-rise" style={rise(6)}>
        <div className="flex items-center justify-center gap-2 text-2xs text-zinc-500 font-medium">
          <ShieldCheck size={12} />
          <span>{t('onboarding_privacy')}</span>
        </div>
        <p className="text-2xs text-zinc-500 font-medium">
          {t('onboarding_legal_prefix')}{' '}
          <a href="/terminos.html" target="_blank" rel="noopener noreferrer" className="text-led-300 underline">
            {t('onboarding_legal_terms')}
          </a>{' '}
          {t('onboarding_legal_and')}{' '}
          <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-led-300 underline">
            {t('onboarding_legal_privacy')}
          </a>
        </p>
      </div>
    </div>
  );
};
