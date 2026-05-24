import React, { useState } from 'react';
import { GarageState } from '../types';
import { BUS_COLORS, BONDIFY_ACCESSORIES } from '../constants';
import { Trophy, Star, Paintbrush, Award, ArrowLeft, Settings, Lock, Check } from 'lucide-react';
import { Button } from './Button';

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

          <div className="h-44 w-full flex items-center justify-center relative">
            {/* Bondi-Wazer Wrapper */}
            <div
              className={`relative w-64 h-32 transition-all duration-500 ${
                tieneOjitos && gameState.happiness >= 75 ? 'animate-float-waze' : ''
              }`}
              style={{
                transform:
                  tieneOjitos && gameState.happiness < 40
                    ? 'scaleY(0.97) translateY(4px) rotate(-1.5deg)' // Caído sutil en 2D por tristeza
                    : 'none',
              }}
            >
              {/* Luz de Neón Plana en el Chasis */}
              {gameState.accessories.includes('neones_chasis') && (
                <div className="absolute inset-x-8 -bottom-1.5 h-2 bg-blue-500/60 blur-md rounded-full z-0" />
              )}

              {/* Bondi Body (Flat 2D Vector) */}
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-500 z-10 flex flex-col overflow-hidden border-b-4 border-slate-900/10 ${
                  !tieneOjitos
                    ? 'bg-slate-200 border-2 border-slate-300' // Gris inanimado
                    : `${gameState.busColor} border-2 border-slate-950/10`
                }`}
                style={{
                  border: gameState.accessories.includes('fileteado_basico') || gameState.accessories.includes('fileteado_premium')
                    ? '3px double #fbbf24' // Guarda fileteada dorada plana
                    : '2px solid rgba(15,23,42,0.08)',
                }}
              >
                {/* Windows Vector & Interior Stickers */}
                <div className="h-12 w-full bg-slate-950/10 flex items-end px-3 pb-1 gap-2 relative">
                  
                  {/* Dados de Peluche Flat */}
                  {gameState.accessories.includes('dados_peluche') && (
                    <div className="absolute right-12 top-0 text-base animate-swing-flat select-none z-20">🎲</div>
                  )}

                  {/* Perro en el Tablero Flat */}
                  {gameState.accessories.includes('perro_tablero') && (
                    <div className="absolute right-4 bottom-0 text-base animate-nod-flat select-none z-20">🐶</div>
                  )}

                  {/* Luces LED Disco */}
                  {gameState.accessories.includes('luces_led_disco') && (
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay animate-pulse z-0" />
                  )}

                  {/* Pasajeros Vectoriales (Siluetas planas minimalistas) */}
                  <div className="h-7 w-10 bg-slate-950/20 rounded-md ml-auto mr-3 z-10"></div>
                  <div className="h-7 w-10 bg-slate-950/20 rounded-md z-10"></div>
                  <div className="h-7 w-12 bg-slate-950/25 rounded-md rounded-tr-lg z-10 flex items-center justify-center">
                    {/* Faros/Ojitos del Wazer Colectivo */}
                    {tieneOjitos && (
                      <span className="text-lg select-none">
                        {gameState.happiness >= 75 ? '🤩' : gameState.happiness >= 40 ? '👀' : '😢'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sticker "El Porteño" (Fileteado Premium) */}
                {gameState.accessories.includes('fileteado_premium') && (
                  <div className="absolute left-3 bottom-4 text-[8px] font-black text-yellow-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-yellow-400/80 font-serif tracking-wider uppercase select-none">
                    BUS
                  </div>
                )}

                {/* Side Striping (Tira lateral plana de Waze) */}
                <div className="h-2 w-full bg-white/20 mt-4 relative">
                  {/* Sonrisa/Parrilla frontal */}
                  {tieneOjitos && (
                    <div className="absolute right-1.5 -bottom-2 w-7 h-3 bg-slate-900 rounded-b-lg flex items-center justify-center z-20">
                      <div className={`w-3.5 h-0.5 bg-white rounded-full ${gameState.happiness < 40 ? 'translate-y-[-1px]' : ''}`} style={{
                        borderRadius: gameState.happiness >= 40 ? '0 0 100px 100px' : '100px 100px 0 0',
                        height: '2px'
                      }} />
                    </div>
                  )}
                </div>

                {/* Headlights */}
                <div className="absolute right-0 bottom-2.5 w-1 h-2.5 bg-yellow-300 rounded-l-full shadow-sm"></div>
              </div>

              {/* Ruedas Planas estilo Waze */}
              <div className="absolute -bottom-2 left-6 w-8 h-8 bg-slate-900 rounded-full border-2 border-slate-700 flex items-center justify-center z-20 shadow-sm">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  gameState.accessories.includes('tazas_cromadas') ? 'bg-yellow-400 border border-white' : 'bg-slate-500'
                }`} />
              </div>
              <div className="absolute -bottom-2 right-6 w-8 h-8 bg-slate-900 rounded-full border-2 border-slate-700 flex items-center justify-center z-20 shadow-sm">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  gameState.accessories.includes('tazas_cromadas') ? 'bg-yellow-400 border border-white' : 'bg-slate-500'
                }`} />
              </div>

            </div>
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