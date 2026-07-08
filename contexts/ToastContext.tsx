import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    kind: ToastKind;
    message: string;
}

interface ToastContextValue {
    showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } });

const KIND_STYLES: Record<ToastKind, { border: string; icon: React.ReactNode }> = {
    success: {
        border: 'border-luminous-green/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
        icon: <CheckCircle2 className="w-5 h-5 text-luminous-green flex-shrink-0" />
    },
    error: {
        border: 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
        icon: <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
    },
    info: {
        border: 'border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
        icon: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />
    }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev.slice(-2), { id, kind, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4500);
    }, []);

    const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Contenedor de toasts: arriba, debajo del notch */}
            <div className="fixed top-4 left-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`glass-card border rounded-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in slide-in-from-top duration-300 ${KIND_STYLES[toast.kind].border}`}
                    >
                        {KIND_STYLES[toast.kind].icon}
                        <p className="flex-1 text-sm font-semibold text-slate-100 leading-snug whitespace-pre-line">{toast.message}</p>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
