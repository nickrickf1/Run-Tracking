import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, { variant = "success", duration = 4000 } = {}) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, variant }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}

const VARIANTS = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    error: "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300",
    info: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

function ToastContainer({ toasts, onClose }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg animate-slide-in ${VARIANTS[t.variant] || VARIANTS.info}`}
                >
                    <span className="flex-1">{t.message}</span>
                    <button
                        onClick={() => onClose(t.id)}
                        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Chiudi"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
}
