import React, { useState, useEffect } from 'react';
import { UserMode, Routine } from '../types';
import { Settings, Zap, Users, X, Clock, Plus, Trash2, Shield, AlertTriangle, ExternalLink, Trophy, FileText, FlaskConical } from 'lucide-react';
import { deleteAllUserData } from '../utils/privacy';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { usuariosAPI } from '../services/api';

interface ProfileSettingsProps {
    currentMode: UserMode;
    routines?: Routine[];
    onModeChange: (mode: UserMode) => void;
    onUpdateRoutines?: (routines: Routine[]) => void;
    onClose: () => void;
    demoMode?: boolean;
    onToggleDemoMode?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentMode, routines = [], onModeChange, onUpdateRoutines, onClose, demoMode, onToggleDemoMode }) => {
    const { t, language, setLanguage } = useLanguage();
    const { showToast } = useToast();
    const [newLine, setNewLine] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newReturnTime, setNewReturnTime] = useState('');
    const [stats, setStats] = useState<{ puntos: number; nivel: number } | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    // Puntos y nivel reales del backend (otorgados server-side)
    useEffect(() => {
        const cargarStats = async () => {
            const data = await usuariosAPI.obtenerEstadisticas('me');
            if (data?.garage) {
                setStats({
                    puntos: data.garage.puntos || 0,
                    nivel: data.garage.nivel || 1
                });
            }
        };
        cargarStats();
    }, []);

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

    const handleDeleteData = () => {
        if (!confirmingDelete) {
            setConfirmingDelete(true);
            showToast(
                language === 'es' ? 'Tocá de nuevo para confirmar el borrado' : 'Tap again to confirm deletion',
                'info'
            );
            return;
        }
        deleteAllUserData();
        window.location.reload();
    };

    return (
        <div className="absolute inset-0 z-overlay flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="glass-card w-full max-w-sm rounded-sheet p-6 relative animate-in zoom-in-95 my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-200 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-field">
                        <Settings className="w-6 h-6 text-zinc-300" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{t('profile_title')}</h2>
                </div>

                <div className="space-y-5">
                    {/* Puntos reales (server-side) */}
                    {stats && (
                        <div className="flex items-center gap-3 p-4 rounded-card bg-led-400/[0.08] border border-led-500/20">
                            <div className="bg-led-400/15 p-2.5 rounded-field border border-led-500/20">
                                <Trophy className="w-5 h-5 text-led-400" />
                            </div>
                            <div>
                                <p className="font-bold text-zinc-100 text-lg leading-tight font-mono">
                                    {stats.puntos} <span className="font-sans text-base">{t('profile_points')}</span>
                                </p>
                                <p className="text-[11px] text-zinc-400 font-bold">
                                    {t('profile_level')} {stats.nivel}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="space-y-2 pb-2">
                        <p className="text-2xs text-zinc-400 font-bold uppercase tracking-wider">Idioma / Language</p>
                        <div className="flex bg-white/5 border border-white/10 rounded-field p-1 w-full">
                            <button
                                onClick={() => setLanguage('es')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    language === 'es'
                                        ? 'bg-led-500 text-ink-950'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                Castellano (ARG)
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    language === 'en'
                                        ? 'bg-led-500 text-ink-950'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                English (US)
                            </button>
                        </div>
                    </div>

                    {/* Guest Mode Indicator */}
                    {currentMode === UserMode.GUEST && (
                        <div className="bg-led-400/10 border border-led-500/20 p-3.5 rounded-field flex items-center gap-3 mb-4">
                            <Users className="w-5 h-5 text-led-400" />
                            <div>
                                <p className="font-bold text-led-300 text-sm">{language === 'es' ? 'Modo Invitado' : 'Guest Mode'}</p>
                                <p className="text-[10px] text-led-400/80 leading-tight">
                                    {language === 'es' ? 'Estás en una sesión temporal. Los datos no se guardarán al salir.' : 'You are in a temporary guest session. Your data will not be saved.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{t('profile_usage_mode')}</p>
                        <button
                            onClick={() => onModeChange(UserMode.EFFICIENT)}
                            className={`w-full p-4 rounded-card flex items-center justify-between border transition-all ${currentMode === UserMode.EFFICIENT ? 'border-white/20 bg-white/10' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                    <Zap className="w-5 h-5 text-zinc-300" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-zinc-200">{t('onboarding_efficient_title')}</p>
                                    <p className="text-xs text-zinc-400">
                                        {language === 'es' ? 'Solo datos del mapa y horarios' : 'Map details and schedule times only'}
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => onModeChange(UserMode.COMMUNITY)}
                            className={`w-full p-4 rounded-card flex items-center justify-between border transition-all ${currentMode === UserMode.COMMUNITY ? 'border-led-500/40 bg-led-400/10' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 p-2 rounded-lg border border-led-500/20">
                                    <Users className="w-5 h-5 text-led-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-zinc-200">{t('onboarding_community_title')}</p>
                                    <p className="text-xs text-zinc-400">
                                        {language === 'es' ? 'Reportar y validar incidentes en vivo' : 'Report and validate live incidents'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Routines Section */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-led-400" />
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                {language === 'es' ? 'Mis Rutinas (Ida y Vuelta)' : 'My Routines (Outbound / Return)'}
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-3 rounded-card space-y-3">
                            {routines.map(routine => (
                                <div key={routine.id} className="bg-ink-950 border border-white/5 p-3 rounded-field">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="font-bold text-zinc-200">
                                            {language === 'es' ? 'Línea' : 'Line'} <span className="font-mono text-led-400">{routine.line}</span>
                                        </p>
                                        <button onClick={() => handleDeleteRoutine(routine.id)} className="text-zinc-500 hover:text-danger transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold bg-led-400/15 text-led-300 px-1.5 py-0.5 rounded text-2xs">
                                                {language === 'es' ? 'Ida' : 'Outbound'}
                                            </span>
                                            <span className="text-zinc-300 font-semibold font-mono">{routine.time} hs</span>
                                        </div>
                                        {routine.returnTime && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold bg-zinc-700/30 text-zinc-300 px-1.5 py-0.5 rounded text-2xs">
                                                    {language === 'es' ? 'Vuelta' : 'Return'}
                                                </span>
                                                <span className="text-zinc-300 font-semibold font-mono">{routine.returnTime} hs</span>
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
                                    className="glass-input p-2.5 text-sm font-mono"
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">
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
                                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">
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
                                            className="bg-led-500 hover:bg-led-400 text-ink-950 p-2.5 rounded-field disabled:opacity-50 h-[38px] w-[38px] flex items-center justify-center transition-all active:scale-98"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Section */}
                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-ok" />
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                {language === 'es' ? 'Privacidad y Datos' : 'Privacy & Data'}
                            </p>
                        </div>

                        <a
                            href="/privacy-policy.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full p-3 rounded-card flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-300">
                                    {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                                </span>
                            </div>
                            <ExternalLink size={14} className="text-zinc-500" />
                        </a>

                        <a
                            href="/terminos.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full p-3 rounded-card flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-300">
                                    {language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}
                                </span>
                            </div>
                            <ExternalLink size={14} className="text-zinc-500" />
                        </a>

                        <div className="p-4 rounded-card bg-danger/10 border border-danger/20 space-y-3">
                            <div className="flex items-center gap-2 text-danger font-bold">
                                <AlertTriangle size={16} />
                                <p className="text-[10px] uppercase tracking-widest font-bold">
                                    {language === 'es' ? 'Zona de Riesgo' : 'Danger Zone'}
                                </p>
                            </div>
                            <p className="text-[10px] text-danger/90 leading-relaxed font-medium">
                                {language === 'es'
                                    ? 'Esto eliminará permanentemente tus favoritos, rutinas y ID anónimo de este dispositivo de forma definitiva.'
                                    : 'This will permanently delete your saved favorites, routine paths, and anonymous user ID from this browser.'}
                            </p>
                            <button
                                onClick={handleDeleteData}
                                className="w-full py-2.5 bg-danger-dim hover:brightness-110 text-white rounded-field text-xs font-bold transition-all active:scale-98"
                            >
                                {confirmingDelete
                                    ? (language === 'es' ? 'Confirmar borrado' : 'Confirm deletion')
                                    : (language === 'es' ? 'Borrar mis datos locales' : 'Clear my local data')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modo Demo: datos simulados, claramente rotulados en el mapa */}
                {onToggleDemoMode && (
                    <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-card mt-4 border border-white/5">
                        <div className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-led-400" />
                            <div>
                                <p className="font-bold text-zinc-200 text-sm">
                                    {language === 'es' ? 'Modo Demo' : 'Demo Mode'}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                    {language === 'es' ? 'Datos simulados para conocer la app' : 'Simulated data to explore the app'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onToggleDemoMode}
                            className={`w-12 h-6 rounded-full transition-colors relative ${demoMode ? 'bg-led-500' : 'bg-ink-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${demoMode ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                )}

                <p className="mt-8 text-center text-[10px] text-zinc-500 font-medium">
                    {language === 'es' ? 'Podés cambiar esto cuando quieras.' : 'You can change this at any time.'}
                </p>
            </div>
        </div>
    );
};
