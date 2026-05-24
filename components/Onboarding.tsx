import React from 'react';
import { UserMode } from '../types';
import { Zap, Users, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingProps {
  onComplete: (mode: UserMode) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="h-dynamic bg-obsidian flex flex-col p-6 items-center justify-center overflow-y-auto text-slate-100 relative">
      
      {/* Sleek Floating Language Selector */}
      <div className="absolute top-4 right-4 z-50 flex gap-1 bg-white/5 border border-white/10 rounded-full p-1 shadow-md backdrop-blur-md">
        <button
          onClick={() => setLanguage('es')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            language === 'es'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ES
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            language === 'en'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">

        {/* Side-Profile Animated Colectivo Preview Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto relative flex items-center justify-center filter drop-shadow-[0_8px_24px_rgba(16,185,129,0.25)] select-none">
            <svg viewBox="0 0 64 64" className="w-24 h-24">
              <defs>
                <linearGradient id="onboardBusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="windowGlintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <clipPath id="busWindowsClip">
                  {/* Windshield */}
                  <path d="M 44 17 H 51 Q 53 17 53 21 L 53 28 H 44 Z" />
                  {/* Side Window 1 */}
                  <rect x="33" y="17" width="8" height="11" rx="1.5" />
                  {/* Side Window 2 */}
                  <rect x="22" y="17" width="8" height="11" rx="1.5" />
                  {/* Side Window 3 */}
                  <rect x="11" y="17" width="8" height="11" rx="1.5" />
                </clipPath>
                <filter id="onboardGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Undercarriage shadow */}
              <ellipse cx="32" cy="52" rx="26" ry="3.5" fill="rgba(0,0,0,0.6)" />

              {/* Bouncing Bus Chassis Group */}
              <g className="animate-colectivo-bounce">
                {/* Neon glow undercarriage */}
                <line x1="12" y1="46" x2="52" y2="46" stroke="#10B981" strokeWidth="4" strokeLinecap="round" filter="url(#onboardGlow)" opacity="0.9" />

                {/* Main Bus Body (Side Profile) */}
                <path d="M 8 18 C 8 15, 11 14, 14 14 L 46 14 C 50 14, 55 16, 56 22 L 56 42 C 56 44, 54 45, 52 45 L 12 45 C 9 45, 8 44, 8 42 Z" fill="url(#onboardBusGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

                {/* Windshield / Driver window (Front - Right side) */}
                <path d="M 44 17 H 51 Q 53 17 53 21 L 53 28 H 44 Z" fill="#60A5FA" opacity="0.85" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                
                {/* Side window 1 */}
                <rect x="33" y="17" width="8" height="11" rx="1.5" fill="#1E293B" opacity="0.9" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                
                {/* Side window 2 */}
                <rect x="22" y="17" width="8" height="11" rx="1.5" fill="#1E293B" opacity="0.9" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                {/* Side window 3 */}
                <rect x="11" y="17" width="8" height="11" rx="1.5" fill="#1E293B" opacity="0.9" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                {/* Glass Window Reflection Glint overlay */}
                <g clipPath="url(#busWindowsClip)">
                  <rect x="0" y="12" width="15" height="20" fill="url(#windowGlintGrad)" className="animate-window-glint" />
                </g>

                {/* Sleek horizontal neon green stripe */}
                <line x1="8" y1="33" x2="56" y2="33" stroke="#A7F3D0" strokeWidth="1.5" opacity="0.8" />
                <line x1="8" y1="35" x2="56" y2="35" stroke="#10B981" strokeWidth="1" opacity="0.5" />

                {/* Front Headlight (glowing) */}
                <circle cx="56" cy="36" r="2.2" fill="#FBBF24" filter="url(#onboardGlow)" />
                
                {/* Rear Taillight */}
                <circle cx="8" cy="36" r="1.5" fill="#EF4444" />
                
                {/* LED Route Sign */}
                <rect x="25" y="9" width="14" height="4" rx="1" fill="#0F172A" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <text x="27.5" y="12.2" fill="#F59E0B" fontSize="3" fontFamily="monospace" fontWeight="black" letterSpacing="0.2">152</text>
              </g>

              {/* Rotating Wheels (Locked to the ground, spinning!) */}
              {/* Rear Wheel Group */}
              <g className="animate-wheel-spin-rear-side">
                <circle cx="16" cy="46" r="6" fill="#030712" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <circle cx="16" cy="46" r="2.8" fill="#4B5563" />
                {/* Wheel spoke patterns that spin */}
                <line x1="11" y1="46" x2="21" y2="46" stroke="#9CA3AF" strokeWidth="1" />
                <line x1="16" y1="41" x2="16" y2="51" stroke="#9CA3AF" strokeWidth="1" />
                <line x1="12.5" y1="42.5" x2="19.5" y2="49.5" stroke="#9CA3AF" strokeWidth="0.7" />
                <line x1="12.5" y1="49.5" x2="19.5" y2="42.5" stroke="#9CA3AF" strokeWidth="0.7" />
              </g>

              {/* Front Wheel Group --> */}
              <g className="animate-wheel-spin-front-side">
                <circle cx="48" cy="46" r="6" fill="#030712" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <circle cx="48" cy="46" r="2.8" fill="#4B5563" />
                {/* Wheel spoke patterns that spin */}
                <line x1="43" y1="46" x2="53" y2="46" stroke="#9CA3AF" strokeWidth="1" />
                <line x1="48" y1="41" x2="48" y2="51" stroke="#9CA3AF" strokeWidth="1" />
                <line x1="44.5" y1="42.5" x2="51.5" y2="49.5" stroke="#9CA3AF" strokeWidth="0.7" />
                <line x1="44.5" y1="49.5" x2="51.5" y2="42.5" stroke="#9CA3AF" strokeWidth="0.7" />
              </g>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">Bondify</h1>
            <p className="text-slate-400 text-sm mt-1">{t('app_subtitle')}</p>
          </div>
        </div>

        {/* Option Selection Block */}
        <div className="space-y-4 pt-4">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{t('onboarding_question')}</p>

          {/* Option A: Efficient Mode */}
          <button
            onClick={() => onComplete(UserMode.EFFICIENT)}
            className="w-full glass-card border border-white/5 p-5 rounded-2xl hover:bg-white/10 hover:border-slate-500/30 transition-all active:scale-98 group text-left shadow-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:bg-white/10 transition-all shadow-inner">
                <Zap className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">{t('onboarding_efficient_badge')}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">{t('onboarding_efficient_title')}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('onboarding_efficient_desc')}
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
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-500/10 shadow-inner">{t('onboarding_community_badge')}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1 relative z-10">{t('onboarding_community_title')}</h3>
            <p className="text-slate-400 text-xs leading-relaxed relative z-10">
              {t('onboarding_community_desc')}
            </p>
          </button>
        </div>

        {/* Option C: Guest Mode */}
        <button
          onClick={() => onComplete(UserMode.GUEST)}
          className="w-full mt-4 p-3 rounded-xl border border-dashed border-slate-700/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2 group active:scale-98"
        >
          <span className="text-xs font-bold tracking-wider uppercase group-hover:underline">{t('onboarding_guest_btn')}</span>
        </button>
      </div>

      {/* Safety Footer */}
      <div className="text-center pt-8">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
          <ShieldCheck size={12} />
          <span>{t('onboarding_privacy')}</span>
        </div>
      </div>
    </div>
  );
};