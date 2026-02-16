import React, { useState } from 'react';
import { UserMode, Routine } from '../types';
import { Settings, Zap, Users, X, Clock, Plus, Trash2, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { deleteAllUserData, getStoredDataSummary } from '../utils/privacy';

interface ProfileSettingsProps {
    currentMode: UserMode;
    routines?: Routine[];
    onModeChange: (mode: UserMode) => void;
    onUpdateRoutines?: (routines: Routine[]) => void;
    onClose: () => void;
    isPresentationMode?: boolean;
    onTogglePresentationMode?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentMode, routines = [], onModeChange, onUpdateRoutines, onClose, isPresentationMode, onTogglePresentationMode }) => {
    const [newLine, setNewLine] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newReturnTime, setNewReturnTime] = useState('');

    const handleAddRoutine = () => {
        if (!newLine || !newTime || !onUpdateRoutines) return;
        const newRoutine: Routine = {
            id: Math.random().toString(),
            line: newLine,
            time: newTime,
            returnTime: newReturnTime || undefined,
            active: true
        };
        onUpdateRoutines([...routines, newRoutine]);
        setNewLine('');
        setNewTime('');
        setNewReturnTime('');
    };

    const handleDeleteRoutine = (id: string) => {
        if (!onUpdateRoutines) return;
        onUpdateRoutines(routines.filter(r => r.id !== id));
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-slate-100 p-3 rounded-full">
                        <Settings className="w-6 h-6 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Configuración</h2>
                </div>

                <div className="space-y-6">
                    {/* Guest Mode Indicator */}
                    {currentMode === UserMode.GUEST && (
                        <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center gap-3 mb-4">
                            <Users className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="font-bold text-orange-900 text-sm">Modo Invitado</p>
                                <p className="text-[10px] text-orange-700 leading-tight">
                                    Estás en una sesión temporal. Los datos no se guardarán al salir.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 font-medium">Modo de uso</p>
                        <button
                            onClick={() => onModeChange(UserMode.EFFICIENT)}
                            className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all ${currentMode === UserMode.EFFICIENT ? 'border-slate-800 bg-slate-50' : 'border-transparent hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                    <Zap className="w-5 h-5 text-slate-700" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">Modo Eficiente</p>
                                    <p className="text-xs text-slate-500">Solo dame la data</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => onModeChange(UserMode.COMMUNITY)}
                            className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all ${currentMode === UserMode.COMMUNITY ? 'border-indigo-600 bg-indigo-50' : 'border-transparent hover:bg-indigo-50/50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-indigo-900">Modo Comunidad</p>
                                    <p className="text-xs text-indigo-500">Jugar y sumar puntos</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Routines Section */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            <p className="text-sm text-slate-500 font-medium">Mis Rutinas (Ida y Vuelta)</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-3">
                            {routines.map(routine => (
                                <div key={routine.id} className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-slate-800">Línea {routine.line}</p>
                                        <button onClick={() => handleDeleteRoutine(routine.id)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold bg-indigo-50 text-indigo-700 px-1 rounded">Ida</span>
                                            {routine.time} hs
                                        </div>
                                        {routine.returnTime && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold bg-orange-50 text-orange-700 px-1 rounded">Vuelta</span>
                                                {routine.returnTime} hs
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    placeholder="Línea (ej: 60)"
                                    value={newLine}
                                    onChange={e => setNewLine(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500"
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Ida</label>
                                        <input
                                            type="time"
                                            value={newTime}
                                            onChange={e => setNewTime(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Vuelta (Opcional)</label>
                                        <input
                                            type="time"
                                            value={newReturnTime}
                                            onChange={e => setNewReturnTime(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleAddRoutine}
                                            disabled={!newLine || !newTime}
                                            className="bg-indigo-600 text-white p-2 mb-[1px] rounded-lg disabled:opacity-50 h-[38px] w-[38px] flex items-center justify-center"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <p className="text-sm text-slate-500 font-medium">Privacidad y Datos</p>
                        </div>

                        <div className="space-y-2">
                            <a
                                href="/privacy-policy.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full p-3 rounded-xl flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-bold text-slate-700">Política de Privacidad</span>
                                </div>
                                <ExternalLink size={14} className="text-slate-400" />
                            </a>

                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 space-y-3">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle size={16} />
                                    <p className="text-xs font-bold uppercase tracking-wider">Zona de Riesgo</p>
                                </div>
                                <p className="text-[10px] text-red-600 leading-tight">
                                    Esto eliminará permanentemente tus favoritos, rutinas y ID anónimo de este dispositivo.
                                </p>
                                <button
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de que querés borrar todos tus datos locales? Esta acción no se puede deshacer.')) {
                                            deleteAllUserData();
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                                >
                                    Borrar mis datos locales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Presentation Mode Toggle (Hackathon) */}
                {onTogglePresentationMode && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mt-4 border border-sate-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎥</span>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">Modo Presentación</p>
                                <p className="text-[10px] text-slate-500">Habilitar controles de demo</p>
                            </div>
                        </div>
                        <button
                            onClick={onTogglePresentationMode}
                            className={`w-12 h-6 rounded-full transition-colors relative ${isPresentationMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isPresentationMode ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                )}

                <p className="mt-8 text-center text-xs text-slate-400">
                    Podés cambiar esto cuando quieras.
                </p>
            </div>
        </div>
    );
};
