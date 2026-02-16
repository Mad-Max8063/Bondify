import React from 'react';
import { Bus, Clock, Check, X } from 'lucide-react';

interface SmartNudgeProps {
    line: string;
    onConfirm: () => void;
    onDeny: () => void;
}

export const SmartNudge: React.FC<SmartNudgeProps> = ({ line, onConfirm, onDeny }) => {
    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-indigo-100 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">Rutina Detectada</p>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">
                            ¿Estás yendo a tomar el <span className="text-indigo-600">{line}</span>?
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Es tu horario habitual.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onDeny}
                        className="flex-1 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> No hoy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Check size={18} /> Sí, activar
                    </button>
                </div>
            </div>
        </div>
    );
};
