import { useState, useCallback } from 'react';
import { ToastProps } from '../components/ui/Toast';

interface Toast extends ToastProps {
    id: string;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<ToastProps, 'onClose'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id, onClose: () => removeToast(id) }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message: string) => {
        addToast({ message, type: 'success' });
    }, [addToast]);

    const error = useCallback((message: string) => {
        addToast({ message, type: 'error' });
    }, [addToast]);

    const info = useCallback((message: string) => {
        addToast({ message, type: 'info' });
    }, [addToast]);

    const warning = useCallback((message: string) => {
        addToast({ message, type: 'warning' });
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    };
};
