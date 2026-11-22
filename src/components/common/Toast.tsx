import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastState } from '../../hooks/useFuelTracker';

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="pointer-events-auto max-w-sm w-full bg-graphite-900/95 dark:bg-graphite-900/95 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl border border-graphite-750 dark:border-graphite-750 border-slate-700 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-hunter-lime shrink-0" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <span className="text-xs font-medium text-slate-100 truncate">
            {toast.message}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                onClose();
              }}
              className="text-xs font-bold text-hunter-lime underline hover:text-lime-300 px-1 py-0.5"
            >
              {toast.actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
