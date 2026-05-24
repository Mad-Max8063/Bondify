import React, { useState } from 'react';
import { GarageState } from '../types';
import { BUS_COLORS, BONDIFY_ACCESSORIES } from '../constants';
import { Trophy, Star, Paintbrush, Award, ArrowLeft, Settings, Lock, Check } from 'lucide-react';
import { Button } from './Button';

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

interface GarageProps {
  gameState: GarageState;
  onUpdateColor: (color: string) => void;
  onEquipAccessory: (id: string) => void;
  onBuyAccessory: (id: string, cost: number) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const Garage: React.FC<GarageProps> = ({
  gameState,
  onUpdateColor,
  onEquipAccessory,
  onBuyAccessory,
  onClose,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior' | 'arte'>('exterior');

  const tieneOjitos = gameState.accessories.includes('ojitos_vida');
  const levelProgress = (gameState.points % 100);
  const gradients = getBusGradients(gameState.busColor, tieneOjitos);

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
      
      {/* Animaciones CSS minimalistas en 2D estilo Waze */}
      <style>{`
        @keyframes float-waze {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes swing-dados-flat {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes nod-dog-flat {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(4deg); }
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
            {/* 3/4 Perspective Pixar-Waze Hybrid Bus SVG */}
            <svg viewBox="0 0 320 220" className="w-full h-full select-none" style={{ maxWidth: '300px' }}>
              <defs>
                {/* Metallic Gold/Chrome Hubcap Gradient */}
                <linearGradient id="chromeGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>

                {/* Soft Ground Shadow */}
                <ellipse id="groundShadow" cx="160" cy="180" rx="100" ry="10" fill="rgba(15,23,42,0.12)" filter="blur(4px)" />
              </defs>

              {/* Floor Shadow */}
              <use href="#groundShadow" />

              {/* Neon bajochasis (Underglow neon light) */}
              {gameState.accessories.includes('neones_chasis') && (
                <ellipse cx="160" cy="180" rx="110" ry="15" fill="rgba(59, 130, 246, 0.65)" filter="blur(8px)" />
              )}

              {/* Disco LED interior light effect */}
              {gameState.accessories.includes('luces_led_disco') && (
                <g opacity="0.35">
                  <polygon points="120,83 260,66 260,115 120,115" fill="#a855f7" className="animate-pulse" />
                </g>
              )}

              {/* CHASSIS: Front Face (facing front-left) */}
              <polygon
                points="50,95 110,80 110,160 50,170"
                fill={gradients.main}
                stroke={gradients.stroke}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* CHASSIS: Side Face (facing side-right, receding) */}
              <polygon
                points="110,80 270,60 270,135 110,160"
                fill={gradients.shadow}
                stroke={gradients.stroke}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* FRONT WINDSHIELD (Glass) */}
              <polygon
                points="56,98 104,86 104,118 56,127"
                fill="#1e293b"
                stroke={gradients.stroke}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Glass Reflection */}
              <polygon
                points="56,98 85,90 70,123 56,127"
                fill="white"
                opacity="0.15"
              />

              {/* EXPRESSIVE EYES (Pixar Windshield Eyes) */}
              {tieneOjitos && (
                <g id="pixar-eyes">
                  {/* LEFT EYE */}
                  <ellipse cx="71" cy="111" rx="6" ry="9" fill="white" stroke="#0f172a" strokeWidth="1.5" />
                  {gameState.accessories.includes('ojitos_vida') && gameState.happiness >= 75 ? (
                    // Ecstatic Curved Happy Eyes
                    <path d="M 68 111 Q 71 106 74 111 Q 71 116 68 111 Z" fill="#2563eb" />
                  ) : (
                    // Normal Blue Iris
                    <circle cx="71" cy="111" r="3.5" fill="#3b82f6" />
                  )}
                  {/* Pupil */}
                  <circle cx="71" cy="111" r="2" fill="#0f172a" />
                  <circle cx="69.5" cy="109.5" r="0.8" fill="white" />

                  {/* RIGHT EYE */}
                  <ellipse cx="89" cy="106.5" rx="6" ry="9" fill="white" stroke="#0f172a" strokeWidth="1.5" />
                  {gameState.accessories.includes('ojitos_vida') && gameState.happiness >= 75 ? (
                    // Ecstatic Curved Happy Eyes
                    <path d="M 86 106.5 Q 89 101.5 92 106.5 Q 89 111.5 86 106.5 Z" fill="#2563eb" />
                  ) : (
                    // Normal Blue Iris
                    <circle cx="89" cy="106.5" r="3.5" fill="#3b82f6" />
                  )}
                  {/* Pupil */}
                  <circle cx="89" cy="106.5" r="2" fill="#0f172a" />
                  <circle cx="87.5" cy="105" r="0.8" fill="white" />

                  {/* Drooping eyelids for Sad State */}
                  {gameState.happiness < 40 && (
                    <g opacity="0.95">
                      {/* Left sad drooping eyelid */}
                      <path d="M 64 101 Q 72 107 78 104 L 78 98 L 64 100 Z" fill={gradients.main} stroke="#0f172a" strokeWidth="1" />
                      {/* Right sad drooping eyelid */}
                      <path d="M 82 97 Q 90 103 96 99 L 96 93 L 82 95 Z" fill={gradients.main} stroke="#0f172a" strokeWidth="1" />
                    </g>
                  )}
                </g>
              )}

              {/* FRONT GRILLE & MOUTH (Trompa / Parrilla / Sonrisa) */}
              {tieneOjitos ? (
                gameState.happiness >= 75 ? (
                  // Wide open ecstatic smile
                  <g>
                    <path d="M 67 143 Q 80 159 93 140 Z" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2.5" />
                    <path d="M 72 149 Q 80 156 88 147" fill="#f43f5e" /> {/* Tongue */}
                  </g>
                ) : gameState.happiness >= 40 ? (
                  // Sweet normal smile
                  <path d="M 68 142 Q 80 152 92 139" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                ) : (
                  // Sad drooping mouth
                  <path d="M 68 148 Q 80 141 92 145" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                )
              ) : (
                // Traditional metal grille if machine mode
                <g stroke="#475569" strokeWidth="1.5">
                  <line x1="65" y1="140" x2="95" y2="133" />
                  <line x1="65" y1="145" x2="95" y2="138" />
                  <line x1="65" y1="150" x2="95" y2="143" />
                </g>
              )}

              {/* HEADLIGHTS (Faros) */}
              {/* Left Farol */}
              <ellipse
                cx="58"
                cy="148"
                rx="5"
                ry="6.5"
                fill={tieneOjitos ? "#fde047" : "#94a3b8"}
                stroke="#0f172a"
                strokeWidth="2"
              />
              {tieneOjitos && (
                <ellipse cx="58" cy="148" rx="2.5" ry="3" fill="white" />
              )}

              {/* Right Farol */}
              <ellipse
                cx="102"
                cy="138"
                rx="5"
                ry="6.5"
                fill={tieneOjitos ? "#fde047" : "#94a3b8"}
                stroke="#0f172a"
                strokeWidth="2"
              />
              {tieneOjitos && (
                <ellipse cx="102" cy="138" rx="2.5" ry="3" fill="white" />
              )}

              {/* SIDE WINDOWS */}
              {/* Window 1 */}
              <polygon points="120,83 160,78 160,110 120,115" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="120,83 140,80 130,113 120,115" fill="white" opacity="0.1" />

              {/* Window 2 */}
              <polygon points="170,77 210,72 210,104 170,109" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="170,77 190,74 180,107 170,109" fill="white" opacity="0.1" />

              {/* Window 3 */}
              <polygon points="220,71 260,66 260,98 220,103" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <polygon points="220,71 240,68 230,101 220,103" fill="white" opacity="0.1" />

              {/* Passenger silouettes inside side windows */}
              <g opacity="0.2">
                <circle cx="185" cy="90" r="4.5" fill="white" />
                <path d="M 178 103 Q 185 96 192 103 Z" fill="white" />
                <circle cx="235" cy="84" r="4.5" fill="white" />
                <path d="M 228 97 Q 235 90 242 97 Z" fill="white" />
              </g>

              {/* SIDE STRIPE (Tira lateral clásica de Colectivo) */}
              <polygon
                points="110,123 270,103 270,108 110,128"
                fill="white"
                opacity="0.25"
              />

              {/* DECORATIONS: Fileteado Porteño Basic / Premium */}
              {(gameState.accessories.includes('fileteado_basico') || gameState.accessories.includes('fileteado_premium')) && (
                <g id="fileteado-art">
                  {/* Basic flourishes on front panel */}
                  <path d="M 52 160 C 65 168, 70 162, 80 162" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 108 150 C 95 156, 90 152, 80 152" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Front panel scroll */}
                  <path d="M 70 85 C 80 88, 85 85, 90 88" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Premium Fileteado on the side */}
                  {gameState.accessories.includes('fileteado_premium') && (
                    <g id="fileteado-premium">
                      {/* Elegant sweeping gold lines on side panels */}
                      <path d="M 115 125 C 160 115, 200 105, 265 92" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 125 72 C 165 67, 215 61, 255 57" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
                      
                      {/* "EL PORTEÑO" Sticker or Ribbon in 3/4 perspective */}
                      <polygon points="135,125 195,115 195,128 135,138" fill="rgba(15,23,42,0.85)" stroke="#fbbf24" strokeWidth="1" />
                      <text x="143" y="134" fill="#fbbf24" fontSize="6.5" fontWeight="900" fontFamily="serif" letterSpacing="1" transform="matrix(0.97 -0.15 0 1 0 0)">
                        EL PORTEÑO
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* WHEELS (Ruedas en perspectiva elíptica) */}
              {/* FRONT WHEEL */}
              <g id="wheel-front">
                {/* Black Tire */}
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
                {/* Black Tire */}
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

              {/* PERRO TABLERO (Bobblehead dog nodding) */}
              {gameState.accessories.includes('perro_tablero') && (
                <g id="perro-dashboard" className="animate-nod-flat" style={{ transformOrigin: '100px 119px' }}>
                  {/* Body */}
                  <ellipse cx="100" cy="119" rx="3.5" ry="2.5" fill="#d97706" stroke="#0f172a" strokeWidth="0.8" />
                  {/* Nodding Head */}
                  <circle cx="100" cy="114" r="2.5" fill="#b45309" stroke="#0f172a" strokeWidth="0.8" />
                  <circle cx="99" cy="114" r="0.4" fill="black" />
                  <path d="M 101 114 L 102.5 116.5" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" />
                </g>
              )}
            </svg>
          </div>

          {/* Cartel Informativo Estilo Waze */}
          {!tieneOjitos ? (
            <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl px-4 py-3 text-xs text-center font-bold max-w-xs mt-3">
              🔒 Colectivo inanimado.<br />
              <span className="text-indigo-600 font-extrabold">Hacé tu primer reporte o viaje</span> para que cobren vida sus ojitos vectoriales.
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-100/50 text-indigo-700 rounded-2xl px-4 py-2.5 text-xs text-center font-bold max-w-xs mt-3">
              {gameState.happiness < 40 
                ? '😢 ¡Se ve triste! Hacé un reporte o viaje para alegrarle la cara en el mapa.'
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