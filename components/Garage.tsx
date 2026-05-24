import React, { useState, useEffect } from 'react';
import { GarageState } from '../types';
import { BUS_COLORS, BONDIFY_ACCESSORIES } from '../constants';
import { Trophy, Star, Paintbrush, ArrowLeft, Settings, Lock, Check } from 'lucide-react';
import { Button } from './Button';

interface GarageProps {
  gameState: GarageState;
  onUpdateColor: (color: string) => void;
  onEquipAccessory: (id: string) => void;
  onBuyAccessory: (id: string, cost: number) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

const getBusGradients = (colorClass: string, isAlive: boolean) => {
  if (!isAlive) {
    return {
      main: '#cbd5e1',
      shadow: '#94a3b8',
      highlight: '#e2e8f0',
      stroke: '#475569'
    };
  }
  switch (colorClass) {
    case 'bg-red-500':
      return { main: '#f87171', shadow: '#ef4444', highlight: '#fca5a5', stroke: '#7f1d1d' };
    case 'bg-green-500':
      return { main: '#34d399', shadow: '#10b981', highlight: '#6ee7b7', stroke: '#064e3b' };
    case 'bg-purple-500':
      return { main: '#a78bfa', shadow: '#8b5cf6', highlight: '#c084fc', stroke: '#4c1d95' };
    case 'bg-yellow-500':
      return { main: '#fbbf24', shadow: '#f59e0b', highlight: '#fde047', stroke: '#78350f' };
    case 'bg-pink-500':
      return { main: '#f472b6', shadow: '#ec4899', highlight: '#fbcfe8', stroke: '#831843' };
    case 'bg-blue-500':
    default:
      return { main: '#60a5fa', shadow: '#3b82f6', highlight: '#93c5fd', stroke: '#1e3a8a' };
  }
};

export const Garage: React.FC<GarageProps> = ({
  gameState,
  onUpdateColor,
  onEquipAccessory,
  onBuyAccessory,
  onClose,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior' | 'arte'>('exterior');
  
  // Interactive Tamagotchi States
  const [bubbleText, setBubbleText] = useState<string>('');
  const [isWiping, setIsWiping] = useState<boolean>(false);
  const [isHonking, setIsHonking] = useState<boolean>(false);
  const [isEating, setIsEating] = useState<boolean>(false);

  const tieneOjitos = gameState.accessories.includes('ojitos_vida');
  const levelProgress = (gameState.points % 100);
  const gradients = getBusGradients(gameState.busColor, tieneOjitos);

  // Auto-clear speech bubble
  useEffect(() => {
    if (bubbleText) {
      const timer = setTimeout(() => {
        setBubbleText('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [bubbleText]);

  // Tamagotchi Handlers
  const triggerHonk = () => {
    if (!tieneOjitos) return;
    setIsHonking(true);
    
    // Random classic Argentine bus honks
    const honks = [
      '¡PUIIP PUIIP! 🔊💨',
      '¡PARAPAPÁÁÁ! 🎺🎵',
      '¡MEEEEP MEEEP! 🚌⚡',
      '¡BOCINAZO PORTEÑO! 📣'
    ];
    const randomHonk = honks[Math.floor(Math.random() * honks.length)];
    setBubbleText(randomHonk);
    
    setTimeout(() => setIsHonking(false), 600);
  };

  const triggerMate = () => {
    if (!tieneOjitos) return;
    setIsEating(true);
    
    // Increase happiness local visual effect (actual state is backend driven, but this feels premium!)
    const mates = [
      '¡Uff, riquísimo! Gracias che 🧉💚',
      '¡Amargo como debe ser! 🧉✨',
      '¡Un elixir para seguir la ruta! 🧉🤩',
      '¿Le pusiste yuyitos? ¡Qué rico! 🧉🌿'
    ];
    setBubbleText(mates[Math.floor(Math.random() * mates.length)]);
    
    setTimeout(() => setIsEating(false), 800);
  };

  const triggerWipe = () => {
    if (!tieneOjitos) return;
    setIsWiping(true);
    setBubbleText('¡Ahora sí veo la ruta! Quedó pipí cucú ✨🧹');
    
    setTimeout(() => setIsWiping(false), 2000);
  };

  // Obtener estado de felicidad
  const getFelicidadTexto = () => {
    if (!tieneOjitos) return 'Modo Máquina (Inanimado)';
    if (gameState.happiness >= 75) return '¡Eufórico por tu ayuda! 🤩';
    if (gameState.happiness >= 40) return 'Contento y en ruta 🙂';
    return 'Triste y descuidado (¡Colaborá!) 😢';
  };

  // Filtrar accesorios por pestaña activa
  const accesoriosFiltrados = BONDIFY_ACCESSORIES.filter(
    (acc) => acc.category === activeTab && !acc.isMilestone
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] overflow-y-auto pb-24 font-sans text-slate-800">
      
      {/* CSS Keyframes for Interactive Tamagotchi Animations */}
      <style>{`
        @keyframes float-waze {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes swing-dados-flat {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes nod-dog-flat {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(4deg) translateY(0.5px); }
        }
        @keyframes wiper-swing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-55deg); }
        }
        @keyframes honk-squash {
          0%, 100% { transform: scale(1); }
          20% { transform: scale(1.08, 0.91) translateY(2px); }
          40% { transform: scale(0.94, 1.06) translateY(-6px); }
          65% { transform: scale(1.03, 0.97) translateY(1px); }
          82% { transform: scale(0.98, 1.01) translateY(0); }
        }
        @keyframes mate-wobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-3deg) scale(1.05); }
          50% { transform: rotate(3deg) scale(1.05); }
          75% { transform: rotate(-1.5deg) scale(1.02); }
        }
        .animate-float-waze {
          animation: float-waze 3s ease-in-out infinite;
        }
        .animate-swing-flat {
          animation: swing-dados-flat 2.5s ease-in-out infinite;
        }
        .animate-nod-flat {
          animation: nod-dog-flat 1.2s ease-in-out infinite;
        }
        .animate-wiper {
          animation: wiper-swing 0.7s ease-in-out infinite;
        }
        .animate-honk {
          animation: honk-squash 0.6s ease-in-out forwards;
        }
        .animate-mate {
          animation: mate-wobble 0.8s ease-in-out forwards;
        }
      `}</style>

      {/* Header Estilo Waze (Limpio y Minimalista) */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-slate-100 flex items-center gap-4">
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Mi Colectivo Virtual
        </h1>
        <button onClick={onOpenSettings} className="ml-auto p-2 hover:bg-slate-50 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        
        {/* Nivel y Progreso Estilo Waze */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Tu Nivel de Conductor</p>
              <h2 className="text-2xl font-black mt-0.5 text-slate-800">Nivel {gameState.level}</h2>
              <p className="text-xs text-indigo-600 font-bold mt-0.5 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                {getFelicidadTexto()}
              </p>
            </div>
            
            {tieneOjitos && (
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-black text-slate-700 mt-1">
                  ❤️ {gameState.happiness}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-extrabold text-slate-400">
              <span>{gameState.points} PUNTOS</span>
              <span>SIGUIENTE: {gameState.level * 100} XP</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Colectivo Vectorial Plano (Flat 2D) estilo Waze */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">Avatar del Mapa</h3>

          <div className="h-56 w-full flex items-center justify-center relative bg-gradient-to-b from-indigo-50/20 to-transparent rounded-3xl overflow-hidden p-2">
            
            {/* Waze style dynamic Speech Bubble above the Colectivo */}
            {bubbleText && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg border border-slate-800 animate-bounce z-40 whitespace-nowrap">
                {bubbleText}
                <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-800" />
              </div>
            )}

            {/* 3/4 Perspective Pixar-Waze Hybrid Bus SVG */}
            <svg 
              viewBox="0 0 320 220" 
              className={`w-full h-full select-none ${
                tieneOjitos && gameState.happiness >= 75 && !isHonking && !isEating ? 'animate-float-waze' : ''
              } ${isHonking ? 'animate-honk' : ''} ${isEating ? 'animate-mate' : ''}`} 
              style={{ 
                maxWidth: '300px',
                transformOrigin: '160px 180px',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <defs>
                {/* Metallic Gold/Chrome Hubcap Gradient */}
                <linearGradient id="chromeGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>

                {/* Chrome Bumper Gradient */}
                <linearGradient id="chromeBumper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="40%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#f8fafc" />
                </linearGradient>

                {/* Soft Ground Shadow */}
                <ellipse id="groundShadow" cx="160" cy="180" rx="105" ry="9" fill="rgba(15,23,42,0.14)" filter="blur(4px)" />
              </defs>

              {/* Floor Shadow */}
              <use href="#groundShadow" />

              {/* Neon bajochasis (Underglow neon light) */}
              {gameState.accessories.includes('neones_chasis') && (
                <ellipse cx="160" cy="180" rx="112" ry="14" fill="rgba(59, 130, 246, 0.65)" filter="blur(8px)" />
              )}

              {/* Disco LED interior light effect */}
              {gameState.accessories.includes('luces_led_disco') && (
                <g opacity="0.35">
                  <polygon points="120,83 260,66 260,115 120,115" fill="#a855f7" className="animate-pulse" />
                </g>
              )}

              {/* ========================================================
                  CHASSIS LAYERS (CLASSIC THREE-TONE BUENOS AIRES LIVERY)
                 ======================================================== */}
              
              {/* LOWER BODY: dynamic color (Mercedes Benz LO 1114 chassis style) */}
              {/* Front Face Lower */}
              <polygon
                points="50,115 110,105 110,160 50,170"
                fill={gradients.main}
                stroke={gradients.stroke}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Side Face Lower */}
              <polygon
                points="110,105 270,85 270,135 110,160"
                fill={gradients.shadow}
                stroke={gradients.stroke}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* MIDDLE STRIPE (Livery colored band: Red/Black classic franja) */}
              {/* Front Stripe */}
              <polygon
                points="50,115 110,105 110,115 50,126"
                fill="#b91c1c" // Classic colectivos red franja
                stroke={gradients.stroke}
                strokeWidth="1.5"
              />
              {/* Side Stripe */}
              <polygon
                points="110,105 270,85 270,93 110,115"
                fill="#b91c1c"
                stroke={gradients.stroke}
                strokeWidth="1.5"
              />

              {/* UPPER SECTION: Glass & Pillars (Mercedes classic LO 1114 round roof cabin) */}
              {/* Front Face Upper */}
              <polygon
                points="50,88 110,75 110,105 50,115"
                fill={gradients.main}
                stroke={gradients.stroke}
                strokeWidth="3"
              />
              {/* Side Face Upper */}
              <polygon
                points="110,75 270,55 270,85 110,105"
                fill={gradients.shadow}
                stroke={gradients.stroke}
                strokeWidth="3"
              />

              {/* ROOF (Techo blanco/crema clásico de los colectivos porteños) */}
              <polygon
                points="52,88 110,75 270,55 264,47 106,66"
                fill="#f8fafc" // Cream white roof
                stroke={gradients.stroke}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* LIGHTED RETRO DESTINATION BOARD (La cartelera luminosa arriba del parabrisas) */}
              <polygon
                points="60,68 104,59 104,78 60,87"
                fill="#fef08a" // Bright yellow-white light glow
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <text x="65" y="79" fill="#0f172a" fontSize="10" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5" transform="matrix(0.97 -0.15 0 1 0 0)">
                152
              </text>

              {/* ========================================================
                  FRONT FACE DETAIL (TROMPA REDONDEADA, PARABRISAS Y FAROS)
                 ======================================================== */}

              {/* MERCEDES CLASSIC PANORAMIC ROUNDED BONNET/HOOD (La trompa redondeada clásica) */}
              <path 
                d="M 50,118 Q 28,128 32,150 Q 35,162 55,161 L 110,147 Q 110,135 110,123 Z"
                fill={gradients.main}
                stroke={gradients.stroke}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* SPLIT WINDSHIELD GLASS (Parabrisas dividido clásico porteño) */}
              {/* Left pane */}
              <polygon points="56,92 78,87 78,110 56,115" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="56,92 70,89 63,113 56,115" fill="white" opacity="0.15" />
              
              {/* Right pane */}
              <polygon points="82,86 104,81 104,104 82,109" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="82,86 96,83 89,107 82,109" fill="white" opacity="0.15" />

              {/* EXPRESSIVE EYES (Pixar Windshield Eyes - dynamically reacting) */}
              {tieneOjitos && (
                <g id="pixar-eyes">
                  {/* LEFT EYE (In left pane) */}
                  <ellipse cx="67" cy="100.5" rx="5" ry="7.5" fill="white" stroke="#0f172a" strokeWidth="1" />
                  {gameState.happiness >= 75 ? (
                    // Ecstatic Happy shape
                    <path d="M 64 100.5 Q 67 96 70 100.5 Q 67 105 64 100.5 Z" fill="#3b82f6" />
                  ) : (
                    // Normal Iris
                    <circle cx="67" cy="100.5" r="2.8" fill="#3b82f6" />
                  )}
                  <circle cx="67" cy="100.5" r="1.5" fill="#0f172a" />
                  <circle cx="65.8" cy="99.3" r="0.6" fill="white" />

                  {/* RIGHT EYE (In right pane) */}
                  <ellipse cx="93" cy="94.5" rx="5" ry="7.5" fill="white" stroke="#0f172a" strokeWidth="1" />
                  {gameState.happiness >= 75 ? (
                    // Ecstatic Happy shape
                    <path d="M 90 94.5 Q 93 90 96 94.5 Q 93 99 90 94.5 Z" fill="#3b82f6" />
                  ) : (
                    // Normal Iris
                    <circle cx="93" cy="94.5" r="2.8" fill="#3b82f6" />
                  )}
                  <circle cx="93" cy="94.5" r="1.5" fill="#0f172a" />
                  <circle cx="91.8" cy="93.3" r="0.6" fill="white" />

                  {/* Drooping eyelids for Sad State */}
                  {gameState.happiness < 40 && (
                    <g opacity="0.95">
                      {/* Left sad drooping eyelid */}
                      <path d="M 61 93 Q 67 98 73 95 L 73 92 Z" fill={gradients.main} stroke="#0f172a" strokeWidth="0.8" />
                      {/* Right sad drooping eyelid */}
                      <path d="M 87 87 Q 93 92 99 89 L 99 86 Z" fill={gradients.main} stroke="#0f172a" strokeWidth="0.8" />
                    </g>
                  )}
                </g>
              )}

              {/* WINDSHIELD WIPERS (Limpiaparabrisas interactivos) */}
              <g id="wipers" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round">
                {/* Left Wiper */}
                <g transform="translate(67, 112)">
                  <line 
                    x1="0" 
                    y1="0" 
                    x2="-6" 
                    y2="-16" 
                    className={isWiping ? 'animate-wiper' : ''} 
                    style={{ transformOrigin: '0px 0px', transition: 'transform 0.1s' }} 
                  />
                </g>
                {/* Right Wiper */}
                <g transform="translate(93, 106)">
                  <line 
                    x1="0" 
                    y1="0" 
                    x2="-6" 
                    y2="-16" 
                    className={isWiping ? 'animate-wiper' : ''} 
                    style={{ transformOrigin: '0px 0px', transition: 'transform 0.1s' }} 
                  />
                </g>
              </g>

              {/* CHROME VINTAGE FRONT GRILLE & MERCEDES LOGO SMILE (Parrilla clásica sonriente) */}
              <path 
                d="M 37,138 Q 45,145 78,136 Q 80,152 40,154 Z"
                fill="#cbd5e1"
                stroke="#475569"
                strokeWidth="1.5"
              />
              {/* Mercedes-style round star smile inside grille */}
              <circle cx="58" cy="144" r="5" fill="none" stroke="white" strokeWidth="2.5" />
              {tieneOjitos ? (
                gameState.happiness >= 75 ? (
                  // Open laughing mouth overlay on bottom snout
                  <path d="M 46,145 Q 58,155 70,142 Z" fill="#7f1d1d" stroke="#0f172a" strokeWidth="1.5" />
                ) : gameState.happiness >= 40 ? (
                  // Cute curved smile
                  <path d="M 48,143 Q 58,150 68,140" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                ) : (
                  // Sad curved mouth
                  <path d="M 48,147 Q 58,142 68,145" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                )
              ) : (
                // Straight technical bars
                <line x1="42" y1="145" x2="74" y2="139" stroke="white" strokeWidth="1.5" />
              )}

              {/* BULBHEAD HEADLIGHTS (Faros circulares clásicos y salientes) */}
              {/* Left Farol */}
              <circle
                cx="34"
                cy="148"
                r="6"
                fill={tieneOjitos ? "#fef08a" : "#94a3b8"} // Glowing yellow LO 1114 bulb
                stroke="#0f172a"
                strokeWidth="2"
              />
              <circle cx="34" cy="148" r="2.5" fill="white" />
              {/* Right Farol */}
              <circle
                cx="84"
                cy="137"
                r="6"
                fill={tieneOjitos ? "#fef08a" : "#94a3b8"}
                stroke="#0f172a"
                strokeWidth="2"
              />
              <circle cx="84" cy="137" r="2.5" fill="white" />

              {/* CLASSIC CHROME BUMPER WITH RUBBER HORNS (Paragolpes con uñas y gomas) */}
              <path 
                d="M 24,158 Q 55,161 94,148 L 93,153 Q 55,166 24,163 Z"
                fill="url(#chromeBumper)"
                stroke="#0f172a"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Rubber bumper horns (Uñas del paragolpes en negro) */}
              <rect x="42" y="152" width="4.5" height="11" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
              <rect x="76" y="143" width="4.5" height="11" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />

              {/* ========================================================
                  SIDE FACE DETAIL (VENTANAS, RUEDAS, FILETEADOS Y ACCESORIOS)
                 ======================================================== */}

              {/* THREE RECDING VENTANAS (Ventanas inclinadas Mercedes clásicas) */}
              {/* Window 1 */}
              <polygon points="120,83 160,78 160,110 120,115" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="120,83 140,80 130,113 120,115" fill="white" opacity="0.1" />

              {/* Window 2 */}
              <polygon points="170,77 210,72 210,104 170,109" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="170,77 190,74 180,107 170,109" fill="white" opacity="0.1" />

              {/* Window 3 */}
              <polygon points="220,71 260,66 260,98 220,103" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="220,71 240,68 230,101 220,103" fill="white" opacity="0.1" />

              {/* Passenger silhouettes inside windows */}
              <g opacity="0.2">
                <circle cx="185" cy="90" r="4.5" fill="white" />
                <path d="M 178 103 Q 185 96 192 103 Z" fill="white" />
                <circle cx="235" cy="84" r="4.5" fill="white" />
                <path d="M 228 97 Q 235 90 242 97 Z" fill="white" />
              </g>

              {/* DECORATIONS: Fileteado Porteño Basic / Premium */}
              {(gameState.accessories.includes('fileteado_basico') || gameState.accessories.includes('fileteado_premium')) && (
                <g id="fileteado-art">
                  {/* Basic flourishes on front rounded snout */}
                  <path d="M 40,128 C 45,134, 48,131, 55,133" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 85,123 C 80,128, 77,126, 70,128" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
                  
                  {/* Front hood line */}
                  <path d="M 52,159 C 62,157, 72,154, 82,152" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Premium Fileteado on the side panels */}
                  {gameState.accessories.includes('fileteado_premium') && (
                    <g id="fileteado-premium">
                      {/* Elegant gold swirls above wheels and along the franja */}
                      <path d="M 115,123 C 160,113, 200,103, 265,90" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 125,72 C 165,67, 215,61, 255,57" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
                      
                      {/* "EL PORTEÑO" Banner in 3/4 perspective */}
                      <polygon points="135,125 195,115 195,128 135,138" fill="rgba(15,23,42,0.85)" stroke="#fbbf24" strokeWidth="1" />
                      <text x="143" y="134" fill="#fbbf24" fontSize="6.5" fontWeight="900" fontFamily="serif" letterSpacing="1" transform="matrix(0.97 -0.15 0 1 0 0)">
                        EL PORTEÑO
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* WHEELS (Mercedes LO 1114 robust perspective ellipses) */}
              {/* FRONT WHEEL */}
              <g id="wheel-front">
                <ellipse cx="145" cy="155" rx="14" ry="18" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <ellipse cx="145" cy="155" rx="10" ry="13.5" fill="#1e293b" />
                
                {/* Chrome Hubcap (Tazas Cromadas) */}
                {gameState.accessories.includes('tazas_cromadas') ? (
                  <g>
                    <ellipse cx="145" cy="155" rx="7" ry="9.5" fill="url(#chromeGold)" stroke="white" strokeWidth="1" />
                    <ellipse cx="145" cy="155" rx="4" ry="5.5" fill="#fef08a" />
                    <ellipse cx="145" cy="155" rx="1.5" ry="2" fill="white" />
                  </g>
                ) : (
                  <ellipse cx="145" cy="155" rx="6" ry="8" fill="#64748b" />
                )}
              </g>

              {/* REAR WHEEL */}
              <g id="wheel-rear">
                <ellipse cx="230" cy="144" rx="14" ry="18" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <ellipse cx="230" cy="144" rx="10" ry="13.5" fill="#1e293b" />

                {/* Chrome Hubcap (Tazas Cromadas) */}
                {gameState.accessories.includes('tazas_cromadas') ? (
                  <g>
                    <ellipse cx="230" cy="144" rx="7" ry="9.5" fill="url(#chromeGold)" stroke="white" strokeWidth="1" />
                    <ellipse cx="230" cy="144" rx="4" ry="5.5" fill="#fef08a" />
                    <ellipse cx="230" cy="144" rx="1.5" ry="2" fill="white" />
                  </g>
                ) : (
                  <ellipse cx="230" cy="144" rx="6" ry="8" fill="#64748b" />
                )}
              </g>

              {/* INTERIOR ACCESSORIES: Dados de peluche y perro que se mueven */}
              {/* DADOS DE PELUCHE */}
              {gameState.accessories.includes('dados_peluche') && (
                <g id="dados-hanging" className="animate-swing-flat" style={{ transformOrigin: '80px 85px' }}>
                  {/* Hanging thread */}
                  <line x1="80" y1="87" x2="80" y2="105" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Dice 1 (White 3D Cube in perspective) */}
                  <polygon points="76,105 82,103 82,109 76,111" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
                  <polygon points="82,103 86,105 86,111 82,109" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.8" />
                  <polygon points="76,105 80,101 86,105 82,103" fill="#cbd5e1" stroke="#0f172a" strokeWidth="0.8" />
                  <circle cx="79" cy="107" r="0.6" fill="black" />
                  <circle cx="84" cy="107" r="0.6" fill="black" />
                  
                  {/* Dice 2 (Slightly behind, overlapping) */}
                  <polygon points="81,109 87,107 87,113 81,115" fill="#f87171" stroke="#0f172a" strokeWidth="0.8" />
                  <polygon points="87,107 91,109 91,115 87,113" fill="#ef4444" stroke="#0f172a" strokeWidth="0.8" />
                  <polygon points="81,109 85,105 91,109 87,107" fill="#b91c1c" stroke="#0f172a" strokeWidth="0.8" />
                </g>
              )}

              {/* PERRO TABLERO (Bobblehead dog nodding inside front windshield pane) */}
              {gameState.accessories.includes('perro_tablero') && (
                <g id="perro-dashboard" className="animate-nod-flat" style={{ transformOrigin: '96px 108px' }}>
                  {/* Body */}
                  <ellipse cx="96" cy="108" rx="3.5" ry="2.5" fill="#d97706" stroke="#0f172a" strokeWidth="0.8" />
                  {/* Nodding Head */}
                  <circle cx="96" cy="103" r="2.5" fill="#b45309" stroke="#0f172a" strokeWidth="0.8" />
                  <circle cx="95" cy="103" r="0.4" fill="black" />
                  <path d="M 97 103 L 98.5 105.5" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" />
                </g>
              )}
            </svg>
          </div>

          {/* ========================================================
              VIRTUAL TAMAGOTCHI INTERACTIVE BUTTONS PANEL
             ======================================================== */}
          {tieneOjitos && (
            <div className="flex gap-2.5 mt-5 w-full max-w-xs justify-center z-10">
              <button
                onClick={triggerHonk}
                className="flex-1 py-2 px-3 bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 text-yellow-800 font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                📢 Bocina
              </button>
              <button
                onClick={triggerMate}
                className="flex-1 py-2 px-3 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 text-emerald-800 font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                🧉 Cebar Mate
              </button>
              <button
                onClick={triggerWipe}
                className="flex-1 py-2 px-3 bg-sky-100 hover:bg-sky-200 border border-sky-200 text-sky-800 font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                🧹 Limpiar
              </button>
            </div>
          )}

          {/* Cartel Informativo Estilo Waze */}
          {!tieneOjitos ? (
            <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl px-4 py-3 text-xs text-center font-bold max-w-xs mt-3">
              🔒 Colectivo inanimado.<br />
              <span className="text-indigo-600 font-extrabold">Hacé tu primer reporte o viaje</span> para que cobren vida sus ojitos vectoriales.
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-100/50 text-indigo-700 rounded-2xl px-4 py-2.5 text-xs text-center font-bold max-w-xs mt-3">
              {gameState.happiness < 40 
                ? '😢 ¡Se ve triste! Hacé un reporte o cebale un mate para alegrarle la cara.'
                : '😎 ¡Excelente! Tu colectivo está feliz y reluciente en el mapa.'}
            </div>
          )}
        </div>

        {/* Customization Options (Waze Flat Style) */}
        {tieneOjitos && (
          <div className="space-y-6">
            
            {/* Color Selector */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-slate-400" />
                <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Color de Carrocería</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {BUS_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateColor(color)}
                    className={`w-9 h-9 rounded-full shrink-0 ${color} shadow-sm border-2 transition-transform ${
                      gameState.busColor === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tuning categories */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex border-b border-slate-100">
                {(['exterior', 'interior', 'arte'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 pb-3 text-xs font-black uppercase border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Accessories list */}
              <div className="space-y-3">
                {accesoriosFiltrados.map((item) => {
                  const tieneItem = gameState.accessories.includes(item.id);
                  const nivelBloqueado = gameState.level < item.levelRequired;
                  const puntosInsuficientes = gameState.points < item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-2xl p-3 flex items-center justify-between transition-all ${
                        nivelBloqueado ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl bg-slate-50 p-2 rounded-xl select-none">{item.emoji}</div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{item.name}</h4>
                          <p className="text-slate-400 text-[11px] leading-tight mt-0.5">{item.description}</p>
                          {nivelBloqueado && (
                            <span className="text-[9px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded-full mt-1.5 inline-block flex items-center gap-1">
                              <Lock size={9} /> Requiere Nivel {item.levelRequired}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        {nivelBloqueado ? (
                          <div className="p-2 bg-slate-100 text-slate-400 rounded-full">
                            <Lock size={16} />
                          </div>
                        ) : tieneItem ? (
                          <button
                            onClick={() => onEquipAccessory(item.id)}
                            className="bg-green-50 text-green-600 p-2 rounded-full flex items-center justify-center border border-green-100"
                          >
                            <Check size={16} />
                          </button>
                        ) : (
                          <Button
                            variant={puntosInsuficientes ? 'secondary' : 'community'}
                            onClick={() => onBuyAccessory(item.id, item.cost)}
                            disabled={puntosInsuficientes}
                            className="py-1 px-2.5 text-xs font-extrabold rounded-xl"
                          >
                            {item.cost} XP
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};