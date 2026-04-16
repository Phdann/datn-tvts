import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const toast = {
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts }) => {
    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
                        pointer-events-auto
                        min-w-[300px] max-w-md
                        px-4 py-3 rounded-none shadow-2xl
                        flex items-center gap-3
                        animate-in slide-in-from-right duration-300
                        ${t.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' : ''}
                        ${t.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-800' : ''}
                        ${t.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-800' : ''}
                        ${t.type === 'warning' ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-800' : ''}
                    `}
                >
                    <div className="flex-1 text-sm font-bold tracking-tight">
                        {t.message}
                    </div>
                </div>
            ))}
        </div>
    );
};
