import React from 'react';
import { GarageState } from '../types';
import { BUS_COLORS } from '../constants';
import { Trophy, Star, Paintbrush, Award, ArrowLeft, Settings } from 'lucide-react';
import { Button } from './Button';

interface GarageProps {
  gameState: GarageState;
  onUpdateColor: (color: string) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const Garage: React.FC<GarageProps> = ({ gameState, onUpdateColor, onClose, onOpenSettings }) => {
  // Mock progress calculation
  const progress = (gameState.points % 100);

  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Mi Garage
        </h1>
        <button onClick={onOpenSettings} className="ml-auto p-2 hover:bg-slate-100 rounded-full">
          <Settings className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Nivel Actual</p>
              <h2 className="text-3xl font-black mt-1">Nivel {gameState.level}</h2>
              <p className="text-sm text-indigo-100 opacity-80 mt-1">"El Chupete"</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-indigo-200">
              <span>{gameState.points} XP</span>
              <span>Siguiente Nivel: {gameState.level * 100} XP</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* The 3D Bus Preview (Visual CSS approximation) */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Tu Bondi Personal</h3>
          <div className="relative w-64 h-40 group cursor-pointer transition-transform active:scale-95">
            {/* Bus Body */}
            <div className={`absolute inset-0 rounded-3xl ${gameState.busColor} shadow-2xl transition-colors duration-300 flex flex-col overflow-hidden border-b-8 border-black/20`}>
              {/* Windows */}
              <div className="h-1/2 w-full bg-sky-200/50 flex items-end px-2 pb-2 gap-2 border-b-4 border-black/10">
                <div className="h-12 w-16 bg-slate-800/80 rounded-lg ml-auto mr-4"></div>
                <div className="h-12 w-16 bg-slate-800/80 rounded-lg"></div>
                <div className="h-12 w-20 bg-slate-800/80 rounded-lg rounded-tr-2xl"></div>
              </div>
              {/* Side Striping */}
              <div className="h-4 w-full bg-white/30 mt-4"></div>

              {/* Headlights */}
              <div className="absolute right-0 bottom-4 w-2 h-4 bg-yellow-300 rounded-l-full shadow-[0_0_10px_rgba(253,224,71,0.8)]"></div>
            </div>
            {/* Wheels */}
            <div className="absolute -bottom-4 left-8 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
            </div>
            <div className="absolute -bottom-4 right-8 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Paintbrush className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-700">Pintura</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {BUS_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdateColor(color)}
                className={`w-12 h-12 rounded-full ${color} shadow-sm border-4 transition-transform ${gameState.busColor === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
              />
            ))}
          </div>
        </div>

        {/* Achievements / Collection */}
        <div className="space-y-4 opacity-60 grayscale pointer-events-none relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-slate-900/80 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm">
              Desbloquea en Nivel 2
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-700">Fileteado y Stickers</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-slate-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};