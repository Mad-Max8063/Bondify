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
        border: 'border-ok/40',
        icon: <CheckCircle2 className="w-5 h-5 text-ok shrink-0" />
    },
    error: {
        border: 'border-danger/40',
        icon: <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
    },
    info: {
        border: 'border-led-500/40',
        icon: <Info className="w-5 h-5 text-led-400 shrink-0" />
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
            <div className="fixed top-4 left-4 right-4 z-toast flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`glass-card border rounded-card px-4 py-3 flex items-center gap-3 pointer-events-auto animate-rise ${KIND_STYLES[toast.kind].border}`}
                    >
                        {KIND_STYLES[toast.kind].icon}
                        <p className="flex-1 text-sm font-semibold text-zinc-100 leading-snug whitespace-pre-line">{toast.message}</p>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
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
