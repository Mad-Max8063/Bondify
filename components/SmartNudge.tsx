import React from 'react';
import { Clock, Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SmartNudgeProps {
    line: string;
    onConfirm: () => void;
    onDeny: () => void;
}

export const SmartNudge: React.FC<SmartNudgeProps> = ({ line, onConfirm, onDeny }) => {
    const { t, language } = useLanguage();

    return (
        <div className="fixed top-4 left-4 right-4 z-alert animate-in slide-in-from-top duration-500 animate-rise">
            <div className="glass-card rounded-card shadow-pop p-4 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="bg-led-400/15 p-3 rounded-field border border-led-500/20 shrink-0">
                        <Clock className="w-6 h-6 text-led-400 animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <p className="text-2xs font-bold text-zinc-400 uppercase">{t('nudge_title')}</p>
                        <h3 className="text-lg font-bold text-zinc-100 leading-tight">
                            {language === 'es'
                                ? <>¿Estás yendo a tomar el <span className="font-mono text-led-400">{line}</span>?</>
                                : <>Heading out to catch the <span className="font-mono text-led-400">{line}</span>?</>}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">{t('nudge_desc')}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onDeny}
                        className="flex-1 py-2 rounded-field text-zinc-400 font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 active:scale-98"
                    >
                        <X size={18} /> {t('nudge_deny')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-field bg-led-500 text-ink-950 font-bold hover:bg-led-400 transition-colors flex items-center justify-center gap-2 active:scale-98"
                    >
                        <Check size={18} /> {t('nudge_confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};
