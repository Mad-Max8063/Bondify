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
        <div className="absolute top-0 left-0 right-0 z-40 pointer-events-auto">
            <div className="bg-luminous-amber/90 backdrop-blur-md text-obsidian px-4 py-2 flex items-center justify-center gap-2 shadow-lg">
                <FlaskConical className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-black uppercase tracking-wider">
                    {t('demo_banner')}
                </p>
                <button
                    onClick={onExit}
                    className="ml-2 flex items-center gap-1 bg-obsidian/20 hover:bg-obsidian/30 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-colors"
                >
                    <X size={12} /> {t('demo_exit')}
                </button>
            </div>
        </div>
    );
};
