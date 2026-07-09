import React from 'react';
import { FlaskConical, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DemoBannerProps {
    onExit: () => void;
}

/**
 * Banner fijo y bien visible mientras el modo demo está activo:
 * los datos del mapa son simulados y NUNCA deben leerse como reales.
 */
export const DemoBanner: React.FC<DemoBannerProps> = ({ onExit }) => {
    const { t } = useLanguage();

    return (
        <div className="absolute top-0 left-0 right-0 z-banner pointer-events-auto">
            <div className="bg-ink-900/95 backdrop-blur-md text-led-400 px-4 py-2 flex items-center justify-center gap-2 border-b border-led-500/30">
                <FlaskConical className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold font-mono uppercase tracking-wider">
                    {t('demo_banner')}
                </p>
                <button
                    onClick={onExit}
                    className="ml-2 flex items-center gap-1 bg-led-400/15 hover:bg-led-400/25 px-2 py-0.5 rounded-lg text-2xs font-bold uppercase transition-colors active:scale-98"
                >
                    <X size={12} /> {t('demo_exit')}
                </button>
            </div>
        </div>
    );
};
