import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-lg bg-graphite-900 dark:bg-graphite-900 bg-white text-slate-100 dark:text-slate-100 text-slate-900 rounded-t-3xl sm:rounded-3xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-graphite-700/80 dark:bg-graphite-700/80 bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3 border-b border-graphite-800/80 dark:border-graphite-800/80 border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white dark:text-white text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-graphite-800/70 dark:bg-graphite-800/70 bg-slate-100 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-4 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
