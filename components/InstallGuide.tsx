import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Download, Smartphone, CheckCircle } from 'lucide-react';

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
    const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
    const [currentStep, setCurrentStep] = useState(0);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    // Listen for beforeinstallprompt (Android/Chrome)
    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Already installed?
    if (deviceInfo.isStandalone) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">¡Ya instalaste Bondify!</h2>
                    <p className="text-slate-500 mb-4">Estás usando la app instalada. ¡Genial!</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                        Continuar
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

    // iOS Instructions
    const iosSteps = [
        {
            icon: <Share className="w-6 h-6" />,
            title: 'Tocá el botón Compartir',
            description: 'Buscá el ícono □↑ en la barra de Safari'
        },
        {
            icon: <Plus className="w-6 h-6" />,
            title: 'Agregar a pantalla de inicio',
            description: 'Deslizá hacia abajo y tocá "Agregar a pantalla de inicio"'
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: 'Confirmá y listo',
            description: 'Tocá "Agregar" y Bondify aparecerá como app'
        }
    ];

    // Android Instructions (when no prompt available)
    const androidSteps = [
        {
            icon: <Download className="w-6 h-6" />,
            title: 'Menú del navegador',
            description: 'Tocá los 3 puntos ⋮ en Chrome'
        },
        {
            icon: <Plus className="w-6 h-6" />,
            title: 'Instalar aplicación',
            description: 'Seleccioná "Instalar app" o "Agregar a pantalla"'
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: '¡Listo!',
            description: 'Bondify estará en tu pantalla de inicio'
        }
    ];

    const steps = deviceInfo.isIOS ? iosSteps : androidSteps;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🚌</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Instalá Bondify</h2>
                            <p className="text-sm text-slate-500">Acceso rápido desde tu inicio</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Platform indicator */}
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-50 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                        {deviceInfo.isIOS ? 'iPhone / iPad' : 'Android'}
                    </span>
                </div>

                {/* Quick install for Chrome/Android */}
                {deferredPrompt && (
                    <button
                        onClick={handleChromeInstall}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold mb-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                    >
                        <Download className="w-5 h-5" />
                        Instalar ahora
                    </button>
                )}

                {/* Steps */}
                {(!deferredPrompt || deviceInfo.isIOS) && (
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${currentStep === index
                                        ? 'bg-indigo-50 border-2 border-indigo-200'
                                        : 'bg-slate-50'
                                    }`}
                                onClick={() => setCurrentStep(index)}
                            >
                                <div className={`p-2 rounded-lg ${currentStep === index ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">
                                        <span className="text-indigo-600 mr-1">{index + 1}.</span>
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-slate-500">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Benefits */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 text-center">
                        ✨ Sin Play Store ni App Store • Acceso instantáneo • Funciona offline
                    </p>
                </div>
            </div>
        </div>
    );
};
