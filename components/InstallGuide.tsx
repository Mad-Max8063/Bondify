import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Download, Smartphone, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InstallGuideProps {
    onClose: () => void;
}

// Detect platform
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isChrome = /Chrome/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    return { isIOS, isAndroid, isSafari, isChrome, isStandalone };
};

export const InstallGuide: React.FC<InstallGuideProps> = ({ onClose }) => {
    const [deviceInfo] = useState(getDeviceInfo());
    const [currentStep, setCurrentStep] = useState(0);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const { t } = useLanguage();

    // Listen for beforeinstallprompt (Android/Chrome)
    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // iOS Instructions
    const iosSteps = [
        {
            icon: <Share className="w-5 h-5 text-indigo-400" />,
            title: t('install_ios_step1_title'),
            description: t('install_ios_step1_desc')
        },
        {
            icon: <Plus className="w-5 h-5 text-indigo-400" />,
            title: t('install_ios_step2_title'),
            description: t('install_ios_step2_desc')
        },
        {
            icon: <CheckCircle className="w-5 h-5 text-luminous-green" />,
            title: t('install_ios_step3_title'),
            description: t('install_ios_step3_desc')
        }
    ];

    // Android Instructions (when no prompt available)
    const androidSteps = [
        {
            icon: <Download className="w-5 h-5 text-indigo-400" />,
            title: t('install_android_step1_title'),
            description: t('install_android_step1_desc')
        },
        {
            icon: <Plus className="w-5 h-5 text-indigo-400" />,
            title: t('install_android_step2_title'),
            description: t('install_android_step2_desc')
        },
        {
            icon: <CheckCircle className="w-5 h-5 text-luminous-green" />,
            title: t('install_android_step3_title'),
            description: t('install_android_step3_desc')
        }
    ];

    const steps = deviceInfo.isIOS ? iosSteps : androidSteps;

    // Already installed?
    if (deviceInfo.isStandalone) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="glass-card border border-slate-700/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center max-h-[90dvh] overflow-y-auto scrollbar-thin">
                    <div className="w-16 h-16 bg-luminous-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-luminous-green/20 animate-pulse">
                        <CheckCircle className="w-8 h-8 text-luminous-green" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 mb-2">{t('install_already_installed')}</h2>
                    <p className="text-slate-400 text-sm mb-4">{t('install_already_installed_desc')}</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all active:scale-98 shadow-lg shadow-indigo-500/20"
                    >
                        {t('install_continue')}
                    </button>
                </div>
            </div>
        );
    }

    // Handle Chrome install prompt
    const handleChromeInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                onClose();
            }
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card border border-slate-700/50 rounded-3xl p-6 max-w-sm w-full shadow-[0_15px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom max-h-[90dvh] overflow-y-auto scrollbar-thin flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border border-indigo-400/20 shadow-md">
                            <span className="text-2xl">🚌</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-100">{t('install_title')}</h2>
                            <p className="text-xs text-slate-400 font-medium">{t('install_subtitle')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors border border-white/5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Platform indicator */}
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">
                        {deviceInfo.isIOS ? 'iPhone / iPad' : 'Android'}
                    </span>
                </div>

                {/* Quick install for Chrome/Android */}
                {deferredPrompt && (
                    <button
                        onClick={handleChromeInstall}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-sm mb-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-98"
                    >
                        <Download className="w-4 h-4" />
                        {t('install_btn_now')}
                    </button>
                )}

                {/* Steps */}
                {(!deferredPrompt || deviceInfo.isIOS) && (
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${currentStep === index
                                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                                onClick={() => setCurrentStep(index)}
                            >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${currentStep === index ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-200 text-sm">
                                        <span className="text-indigo-400 mr-1">{index + 1}.</span>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Benefits */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed">
                        {t('install_benefits')}
                    </p>
                </div>
            </div>
        </div>
    );
};
