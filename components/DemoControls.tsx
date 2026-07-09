import React from 'react';
import { Play, AlertTriangle, Bus } from 'lucide-react';

interface DemoControlsProps {
    onTriggerNudge: () => void;
    onTriggerChaos: () => void;
    onAddGhostBus: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ onTriggerNudge, onTriggerChaos, onAddGhostBus }) => {
    return (
        <div className="absolute bottom-24 left-4 z-chrome pointer-events-auto flex flex-col gap-2">
            <div className="glass-card border-led-500/30 p-3 rounded-card space-y-2">
                <p className="text-2xs uppercase font-bold text-led-400 tracking-wider mb-1 font-mono">Modo Demo</p>

                <button
                    onClick={onTriggerNudge}
                    className="w-full flex items-center gap-2 bg-ink-800 border border-white/10 hover:bg-ink-700 text-zinc-200 text-xs font-bold py-2 px-3 rounded-field transition-colors active:scale-98"
                >
                    <Play size={14} className="text-led-400" />
                    <span>Disparar Alerta "Salí Ya"</span>
                </button>

                <button
                    onClick={onTriggerChaos}
                    className="w-full flex items-center gap-2 bg-ink-800 border border-white/10 hover:bg-ink-700 text-zinc-200 text-xs font-bold py-2 px-3 rounded-field transition-colors active:scale-98"
                >
                    <AlertTriangle size={14} className="text-danger" />
                    <span>Simular Caos (IA)</span>
                </button>

                <button
                    onClick={onAddGhostBus}
                    className="w-full flex items-center gap-2 bg-ink-800 border border-white/10 hover:bg-ink-700 text-zinc-200 text-xs font-bold py-2 px-3 rounded-field transition-colors active:scale-98"
                >
                    <Bus size={14} className="text-ok" />
                    <span>+ Bondi Fantasma</span>
                </button>
            </div>
        </div>
    );
};
