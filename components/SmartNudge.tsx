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
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-indigo-100 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">{t('nudge_title')}</p>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">
                            {language === 'es'
                                ? <>¿Estás yendo a tomar el <span className="text-indigo-600">{line}</span>?</>
                                : <>Heading out to catch the <span className="text-indigo-600">{line}</span>?</>}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{t('nudge_desc')}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onDeny}
                        className="flex-1 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> {t('nudge_deny')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Check size={18} /> {t('nudge_confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};
