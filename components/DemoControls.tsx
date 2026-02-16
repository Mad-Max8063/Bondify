import React from 'react';
import { Play, AlertTriangle, Bus } from 'lucide-react';

interface DemoControlsProps {
    onTriggerNudge: () => void;
    onTriggerChaos: () => void;
    onAddGhostBus: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ onTriggerNudge, onTriggerChaos, onAddGhostBus }) => {
    return (
        <div className="absolute bottom-24 left-4 z-50 pointer-events-auto flex flex-col gap-2">
            <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-slate-700/50 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Modo Demo</p>

                <button
                    onClick={onTriggerNudge}
                    className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                >
                    <Play size={14} />
                    <span>Disparar Alerta "Salí Ya"</span>
                </button>

                <button
                    onClick={onTriggerChaos}
                    className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                >
                    <AlertTriangle size={14} />
                    <span>Simular Caos (IA)</span>
                </button>

                <button
                    onClick={onAddGhostBus}
                    className="w-full flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                >
                    <Bus size={14} />
                    <span>+ Bondi Fantasma</span>
                </button>
            </div>
        </div>
    );
};
