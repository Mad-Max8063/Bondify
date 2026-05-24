import React, { useState } from 'react';
import { UserMode, Routine } from '../types';
import { Settings, Zap, Users, X, Clock, Plus, Trash2, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { deleteAllUserData, getStoredDataSummary } from '../utils/privacy';
import { useLanguage } from '../contexts/LanguageContext';

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
    const { t, language, setLanguage } = useLanguage();
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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="glass-card border border-slate-700/50 w-full max-w-sm rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl shadow-inner">
                        <Settings className="w-6 h-6 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{t('profile_title')}</h2>
                </div>

                <div className="space-y-5">
                    {/* Language Selector */}
                    <div className="space-y-2 pb-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Idioma / Language</p>
                        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner w-full">
                            <button
                                onClick={() => setLanguage('es')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    language === 'es'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Castellano (ARG)
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    language === 'en'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                English (US)
                            </button>
                        </div>
                    </div>

                    {/* Guest Mode Indicator */}
                    {currentMode === UserMode.GUEST && (
                        <div className="bg-orange-500/10 border border-orange-500/20 p-3.5 rounded-xl flex items-center gap-3 mb-4">
                            <Users className="w-5 h-5 text-orange-400" />
                            <div>
                                <p className="font-bold text-orange-300 text-sm">{language === 'es' ? 'Modo Invitado' : 'Guest Mode'}</p>
                                <p className="text-[10px] text-orange-400 leading-tight">
                                    {language === 'es' ? 'Estás en una sesión temporal. Los datos no se guardarán al salir.' : 'You are in a temporary guest session. Your data will not be saved.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('profile_usage_mode')}</p>
                        <button
                            onClick={() => onModeChange(UserMode.EFFICIENT)}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${currentMode === UserMode.EFFICIENT ? 'border-slate-500 bg-white/10' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10 shadow-sm">
                                    <Zap className="w-5 h-5 text-slate-300" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-200">{t('onboarding_efficient_title')}</p>
                                    <p className="text-xs text-slate-400">
                                        {language === 'es' ? 'Solo datos del mapa y horarios' : 'Map details and schedule times only'}
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => onModeChange(UserMode.COMMUNITY)}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${currentMode === UserMode.COMMUNITY ? 'border-indigo-500/50 bg-indigo-500/15' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 p-2 rounded-lg border border-indigo-500/20 shadow-sm">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-200">{t('onboarding_community_title')}</p>
                                    <p className="text-xs text-slate-400">
                                        {language === 'es' ? 'Reportar y validar incidentes en vivo' : 'Report and validate live incidents'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Routines Section */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                {language === 'es' ? 'Mis Rutinas (Ida y Vuelta)' : 'My Routines (Outbound / Return)'}
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-3">
                            {routines.map(routine => (
                                <div key={routine.id} className="bg-obsidian-dark border border-slate-800 p-3 rounded-xl shadow-sm">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="font-bold text-slate-200">
                                            {language === 'es' ? `Línea ${routine.line}` : `Line ${routine.line}`}
                                        </p>
                                        <button onClick={() => handleDeleteRoutine(routine.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
                                                {language === 'es' ? 'Ida' : 'Outbound'}
                                            </span>
                                            <span className="text-slate-300 font-semibold">{routine.time} hs</span>
                                        </div>
                                        {routine.returnTime && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded text-[10px]">
                                                    {language === 'es' ? 'Vuelta' : 'Return'}
                                                </span>
                                                <span className="text-slate-300 font-semibold">{routine.returnTime} hs</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-col gap-2 pt-2">
                                <input
                                    type="text"
                                    placeholder={language === 'es' ? 'Línea (ej: 60)' : 'Line (e.g. 60)'}
                                    value={newLine}
                                    onChange={e => setNewLine(e.target.value)}
                                    className="glass-input p-2.5 text-sm"
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider ml-1">
                                            {language === 'es' ? 'Ida' : 'Outbound'}
                                        </label>
                                        <input
                                            type="time"
                                            value={newTime}
                                            onChange={e => setNewTime(e.target.value)}
                                            className="glass-input p-2 w-full text-sm [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider ml-1">
                                            {language === 'es' ? 'Vuelta (Opcional)' : 'Return (Optional)'}
                                        </label>
                                        <input
                                            type="time"
                                            value={newReturnTime}
                                            onChange={e => setNewReturnTime(e.target.value)}
                                            className="glass-input p-2 w-full text-sm [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleAddRoutine}
                                            disabled={!newLine || !newTime}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl disabled:opacity-50 h-[38px] w-[38px] flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] active:scale-95"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                {language === 'es' ? 'Privacidad y Datos' : 'Privacy & Data'}
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            <a
                                href="/privacy-policy.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full p-3 rounded-2xl flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-300">
                                        {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                                    </span>
                                </div>
                                <ExternalLink size={14} className="text-slate-500" />
                            </a>

                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3 shadow-inner">
                                <div className="flex items-center gap-2 text-red-400 font-bold">
                                    <AlertTriangle size={16} />
                                    <p className="text-[10px] uppercase tracking-widest font-black">
                                        {language === 'es' ? 'Zona de Riesgo' : 'Danger Zone'}
                                    </p>
                                </div>
                                <p className="text-[10px] text-red-400/90 leading-relaxed font-medium">
                                    {language === 'es' 
                                        ? 'Esto eliminará permanentemente tus favoritos, rutinas y ID anónimo de este dispositivo de forma definitiva.'
                                        : 'This will permanently delete your saved favorites, routine paths, and anonymous user ID from this browser.'}
                                </p>
                                <button
                                    onClick={() => {
                                        const confirmText = language === 'es' 
                                            ? '¿Estás seguro de que querés borrar todos tus datos locales? Esta acción no se puede deshacer.'
                                            : 'Are you sure you want to delete all local user data? This action is irreversible.';
                                        if (confirm(confirmText)) {
                                            deleteAllUserData();
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(239,68,68,0.25)] active:scale-95"
                                >
                                    {language === 'es' ? 'Borrar mis datos locales' : 'Clear my local data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Presentation Mode Toggle (Hackathon) */}
                {onTogglePresentationMode && (
                    <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl mt-4 border border-white/5 shadow-inner">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎥</span>
                            <div>
                                <p className="font-bold text-slate-200 text-sm">
                                    {language === 'es' ? 'Modo Presentación' : 'Presentation Mode'}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {language === 'es' ? 'Controles simuladores demo' : 'Demo simulator controls'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onTogglePresentationMode}
                            className={`w-12 h-6 rounded-full transition-colors relative ${isPresentationMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPresentationMode ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                )}

                <p className="mt-8 text-center text-[10px] text-slate-500 font-medium">
                    {language === 'es' ? 'Podés cambiar esto cuando quieras.' : 'You can change this at any time.'}
                </p>
            </div>
        </div>
    );
};
